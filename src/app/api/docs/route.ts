import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { formatToWIB } from "@/utils/timezone";
import { fetchOneDriveFolders } from "@/utils/graph-api/fetch-paths";
import { UploadRequest, UploadResult } from "@/types/upload-doc";
import { decryptFile } from "@/lib/crypt";
import {
  deleteFilesFromOneDrive,
  uploadFilesToOneDrive,
} from "@/utils/graph-api/file-utils";
import { getMicrosoftAccessToken } from "@/utils/graph-api/get-access-token";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    } else if (session.user.roles !== "MOD" && session.user.roles !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. MOD or ADMIN role required." },
        { status: 403 }
      );
    }

    const tokenResult = await getMicrosoftAccessToken(session.accountId);

    if (tokenResult.error || !tokenResult.accessToken) {
      console.error("Token error:", tokenResult.error);
      return NextResponse.json(
        { error: "Access token not found or expired." },
        { status: 401 }
      );
    }

    console.log("Access token retrieved successfully");

    const documents = await prisma.document_metadata.findMany({
      orderBy: { last_modified_at: "desc" },
    });

    const folders = await fetchOneDriveFolders(tokenResult.accessToken);

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      created_at: doc.created_at ? formatToWIB(doc.created_at) : null,
      last_modified_at: doc.last_modified_at
        ? formatToWIB(doc.last_modified_at)
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedDocuments,
      folders: folders,
      totalCount: formattedDocuments.length,
    });
  } catch (error) {
    console.error("Error fetching document metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    } else if (session.user.roles !== "MOD" && session.user.roles !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. MOD or ADMIN role required." },
        { status: 403 }
      );
    }

    const { accessToken } = await getMicrosoftAccessToken(session.accountId);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not found in session." },
        { status: 401 }
      );
    }

    const body: UploadRequest = await request.json();
    const { files, folderId } = body;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided for upload." },
        { status: 400 }
      );
    }

    const results: UploadResult[] = [];
    const duplicates: string[] = [];
    let successful = 0;
    let failed = 0;
    const skipped = 0;

    const uploadFiles: {
      originalname: string;
      mimetype: string;
      buffer: Uint8Array;
    }[] = [];

    for (const fileData of files) {
      try {
        const decryptedBuffer = await decryptFile(fileData.encryptedData);

        uploadFiles.push({
          originalname: fileData.name,
          mimetype: fileData.type,
          buffer: decryptedBuffer, // decryptedBuffer is already a Uint8Array
        });
      } catch (decryptError) {
        console.error(`Error decrypting file ${fileData.name}:`, decryptError);
        results.push({
          fileName: fileData.name,
          success: false,
          message: "Failed to decrypt file",
        });
        failed++;
      }
    }

    if (uploadFiles.length > 0) {
      try {
        const targetFolderId = folderId || process.env.RAG_CHATBOT_FOLDER_ID;

        if (!targetFolderId) {
          throw new Error("No target folder ID available");
        }

        const oneDriveResponses = await uploadFilesToOneDrive(
          uploadFiles,
          targetFolderId,
          accessToken
        );

        oneDriveResponses.forEach((oneDriveFile) => {
          const fileName = oneDriveFile.name;

          if (!fileName) {
            console.error(
              "OneDrive response object is missing 'name' property:",
              oneDriveFile
            );
            // Mark as a failure to be safe
            results.push({
              fileName: "Unknown file",
              success: false,
              message: "Malformed response from OneDrive",
            });
            failed++;
            return; // Continue to the next item
          }

          results.push({
            fileName,
            success: true,
            message: "Upload successful",
          });
          successful++;
        });
      } catch (uploadError) {
        console.error("OneDrive upload error:", uploadError);

        uploadFiles.forEach((file) => {
          results.push({
            fileName: file.originalname,
            success: false,
            message:
              uploadError instanceof Error
                ? uploadError.message
                : "Upload failed",
          });
          failed++;
        });
      }
    }

    return NextResponse.json({
      success: successful > 0,
      results,
      summary: {
        total: files.length,
        successful,
        failed,
        skipped,
        duplicates,
      },
    });
  } catch (error) {
    console.error("Error processing upload request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    } else if (session.user.roles !== "MOD" && session.user.roles !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. MOD or ADMIN role required." },
        { status: 403 }
      );
    }

    const { accessToken } = await getMicrosoftAccessToken(session.accountId);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not found in session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileIds } = body;
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "fileIds must be a non-empty array." },
        { status: 400 }
      );
    }

    const { successfulIds, failedDeletions } = await deleteFilesFromOneDrive(
      fileIds,
      accessToken
    );

    if (successfulIds.length > 0) {
      console.log(
        `Successfully deleted ${successfulIds.length} files from OneDrive. Syncing database...`
      );

      try {
        const [metadataDeletion, documentsDeletion] = await prisma.$transaction(
          [
            prisma.document_metadata.deleteMany({
              where: { id: { in: successfulIds } },
            }),

            prisma.documents.deleteMany({
              where: {
                OR: successfulIds.map((id) => ({
                  metadata: {
                    path: ["file_id"],
                    equals: id,
                  },
                })),
              },
            }),
          ]
        );

        console.log("Database sync complete.", {
          deletedFromMetadata: metadataDeletion.count,
          deletedFromDocuments: documentsDeletion.count,
        });
      } catch (dbError) {
        console.error("Database sync failed during transaction:", dbError);
        return NextResponse.json(
          {
            message:
              "Files deleted from OneDrive, but failed to sync database.",
            deletedCount: successfulIds.length,
            dbError: "The database transaction could not be completed.",
          },
          { status: 500 }
        );
      }
    }

    if (failedDeletions.length === 0) {
      return NextResponse.json(
        {
          message: "All files deleted successfully.",
          deletedCount: successfulIds.length,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message:
            "Completed with partial success. Some files could not be deleted.",
          deletedCount: successfulIds.length,
          failedCount: failedDeletions.length,
          failures: failedDeletions,
        },
        { status: 207 }
      );
    }
  } catch (error) {
    console.error("Error processing delete request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
