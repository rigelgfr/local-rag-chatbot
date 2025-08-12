import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import { n8nMessage } from "@/types/chat";
import { formatDisplayTime } from "@/utils/timezone";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const userRoles = Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles];
    if (!userRoles.includes("ADMIN") && !userRoles.includes("MOD")) {
      return NextResponse.json(
        { error: "Unauthorized. MOD or ADMIN role required." },
        { status: 403 }
      );
    }

    const { id: sessionId } = await params;

    // Verify the session exists
    const chatSession = await prisma.chat_sessions.findFirst({
      where: {
        session_id: sessionId,
      },
      select: {
        session_id: true,
        user_id: true,
        created_at: true,
        last_online_at: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Get chat history for this specific session
    const chatHistory = await prisma.chat_history.findMany({
      where: {
        session_id: sessionId,
      },
      select: {
        message: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // Transform messages
    const messages = chatHistory.map((history) => {
      const messageData = history.message as unknown as n8nMessage;
      return {
        created_at: history.created_at,
        type: messageData?.type || null,
        content: messageData?.content || null,
      };
    });

    const result = {
      session_id: chatSession.session_id,
      user_id: chatSession.user_id,
      user: chatSession.user,
      last_online_at: formatDisplayTime(chatSession.last_online_at),
      created_at: chatSession.created_at,
      messages: messages,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
