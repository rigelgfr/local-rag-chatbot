import { prisma } from "@/lib/prisma";
import { n8nMessage } from "@/types/chat";
import { auth } from "@/utils/auth";
import { getMicrosoftAccessToken } from "@/utils/graph-api/get-access-token";
import { checkRateLimit } from "@/utils/limiter";
import { formatDisplayTime, formatToWIB } from "@/utils/timezone";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/chat";
const N8N_BEARER_TOKEN =
  process.env.N8N_BEARER_TOKEN || "your-hardcoded-bearer-token";

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

    const userRoles = Array.isArray(session.user.roles)
      ? session.user.roles
      : [session.user.roles];
    if (!userRoles.includes("ADMIN") && !userRoles.includes("MOD")) {
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

    // Query all unique chat sessions with user data
    const chatSessions = await prisma.chat_sessions.findMany({
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
      orderBy: {
        last_online_at: "desc",
      },
    });

    // Get the newest session (first in the ordered list)
    const newestSession = chatSessions[0];
    let newestSessionMessages: Array<{
      created_at: Date;
      type: "human" | "ai" | null;
      content: string | null;
    }> = [];

    if (newestSession) {
      const chatHistory = await prisma.chat_history.findMany({
        where: {
          session_id: newestSession.session_id,
        },
        select: {
          message: true,
          created_at: true,
        },
        orderBy: {
          created_at: "asc",
        },
      });

      newestSessionMessages = chatHistory.map((history) => {
        const messageData = history.message as unknown as n8nMessage;
        return {
          created_at: history.created_at,
          type: messageData?.type || null,
          content: messageData?.content || null,
        };
      });
    }

    // Combine session data - only newest session gets messages
    const result = chatSessions.map((session) => ({
      session_id: session.session_id,
      user_id: session.user_id,
      user: session.user,
      last_online_at: formatDisplayTime(session.last_online_at),
      created_at: formatToWIB(session.created_at),
      messages:
        session.session_id === newestSession?.session_id
          ? newestSessionMessages
          : [],
    }));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, chatInput } = body;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    const rateLimitKey = `rl:${userId}`;

    const { allowed, reset } = checkRateLimit({
      key: rateLimitKey,
      limit: 2, // e.g. 10 requests
      windowInSeconds: 60, // per 60 seconds
    });

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down.",
          retryAfter: reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    if (!sessionId || !chatInput) {
      return NextResponse.json(
        { error: "sessionId and chatInput are required" },
        { status: 400 }
      );
    }

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    await prisma.chat_sessions.upsert({
      where: {
        user_id_session_id: {
          user_id: session.userId,
          session_id: sessionId,
        },
      },
      update: {
        last_online_at: new Date(),
      },
      create: {
        user_id: session.userId,
        session_id: sessionId,
        last_online_at: new Date(),
      },
    });

    console.log("Sending to n8n:", { sessionId, chatInput });

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${N8N_BEARER_TOKEN}`,
      },
      body: JSON.stringify({
        sessionId,
        chatInput,
      }),
    });

    if (!response.ok) {
      console.error("n8n webhook error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("n8n error response:", errorText);
      return NextResponse.json(
        { error: "Failed to get response from AI service" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("n8n response:", JSON.stringify(data, null, 2));

    let output = "";
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem.output) {
        output = firstItem.output;
      } else {
        console.error("First array item has no output field:", firstItem);
        output =
          "I received your message but the response format was unexpected.";
      }
    } else if (data.output) {
      output = data.output;
    } else if (data.message) {
      output = data.message;
    } else if (data.response) {
      output = data.response;
    } else {
      console.error("Unexpected n8n response structure:", data);
      output =
        "I received your message but had trouble processing the response format.";
    }

    return NextResponse.json({ output });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

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

    const { accessToken } = await getMicrosoftAccessToken(session.accountId);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not found in session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionIds } = body;

    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json(
        { error: "sessionIds must be a non-empty array." },
        { status: 400 }
      );
    }

    // Verify all sessions exist before deletion
    const existingSessions = await prisma.chat_sessions.findMany({
      where: {
        session_id: {
          in: sessionIds,
        },
      },
      select: {
        session_id: true,
      },
    });

    const existingSessionIds = existingSessions.map((s) => s.session_id);
    const nonExistentSessions = sessionIds.filter(
      (id) => !existingSessionIds.includes(id)
    );

    if (nonExistentSessions.length > 0) {
      return NextResponse.json(
        {
          error: `Sessions not found: ${nonExistentSessions.join(", ")}`,
          nonExistentSessions,
        },
        { status: 404 }
      );
    }

    // Delete in transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First delete chat history records
      const deletedHistory = await tx.chat_history.deleteMany({
        where: {
          session_id: {
            in: sessionIds,
          },
        },
      });

      // Then delete chat sessions
      const deletedSessions = await tx.chat_sessions.deleteMany({
        where: {
          session_id: {
            in: sessionIds,
          },
        },
      });

      return {
        deletedHistoryCount: deletedHistory.count,
        deletedSessionsCount: deletedSessions.count,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedSessionsCount} sessions and ${result.deletedHistoryCount} chat history records`,
      deletedSessions: sessionIds,
      ...result,
    });
  } catch (error) {
    console.error("Error deleting chat sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
