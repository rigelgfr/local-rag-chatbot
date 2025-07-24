import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { formatToWIB } from "@/utils/timezone";
import { fetchOneDriveFolders } from "@/utils/graph-api/fetch-paths";

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

    if (session.user.roles !== "MOD" && session.user.roles !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. MOD or ADMIN role required." },
        { status: 403 }
      );
    }

    if (!session.accessToken) {
      return NextResponse.json(
        { error: "Access token missing from session." },
        { status: 401 }
      );
    }

    // Fetch documents from database
    const documents = await prisma.document_metadata.findMany({
      orderBy: { last_modified_at: "desc" },
    });

    // Fetch available folders from OneDrive
    const folders = await fetchOneDriveFolders(session.accessToken);

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
