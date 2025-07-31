import { requireRoles } from "@/lib/check-access";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    const sessionOrResponse = await requireRoles(["USER", "MOD", "ADMIN"]);
    if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

    await prisma.$transaction(async (tx) => {
      const deletedHistory = await tx.chat_history.deleteMany({
        where: {
          session_id: {
            equals: sessionId,
          },
        },
      });

      const deletedSessions = await tx.chat_sessions.deleteMany({
        where: {
          session_id: {
            equals: sessionId,
          },
        },
      });

      return {
        deletedHistoryCount: deletedHistory.count,
        deletedSessionsCount: deletedSessions.count,
      };
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
