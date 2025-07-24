import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/utils/auth";
import { decrypt } from "@/lib/crypt";
import { collectAllSubFolders } from "@/utils/graph-api/fetch-paths";

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
    }

    if (!session.accessToken) {
      return NextResponse.json(
        { error: "Access token not available" },
        { status: 401 }
      );
    }

    const decryptedToken = await decrypt(session.accessToken);

    const targetFolderId = "01Y2G4N7BU7ILSZQARWVDYBCKKTIAQQZH2";
    const targetFolderName = "rag-chatbot";

    const allFolders = [
      {
        id: targetFolderId,
        name: targetFolderName,
        parentPath: "",
        fullPath: targetFolderName,
      },
    ];

    const subFolders = await collectAllSubFolders(
      targetFolderId,
      targetFolderName,
      decryptedToken
    );

    allFolders.push(...subFolders);

    return NextResponse.json({
      success: true,
      folderCount: allFolders.length,
      folders: allFolders,
    });
  } catch (error: unknown) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
