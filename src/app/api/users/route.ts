import { prisma } from "@/lib/prisma";
import { auth } from "@/utils/auth";
import { getMicrosoftAccessToken } from "@/utils/graph-api/get-access-token";
import { formatToWIB } from "@/utils/timezone";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
    } else if (session.user.roles !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. ADMIN role required." },
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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((user) => ({
      ...user,
      createdAt: user.createdAt ? formatToWIB(user.createdAt) : null,
    }));

    return NextResponse.json(
      {
        success: true,
        users: formattedUsers,
        totalCount: formattedUsers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    } else if (session.user.roles !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. ADMIN role required." },
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

    const { changes } = await request.json();

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json(
        { error: "Invalid changes format" },
        { status: 400 }
      );
    }

    const validRoles = ["ADMIN", "MOD", "USER"];
    for (const change of changes) {
      if (!change.userId || !change.role || !validRoles.includes(change.role)) {
        return NextResponse.json(
          { error: "Invalid userId or role in changes" },
          { status: 400 }
        );
      }
    }

    const updatePromises = changes.map(({ userId, role }) =>
      prisma.user.update({
        where: { id: userId },
        data: { role: role },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${changes.length} user(s)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    } else if (session.user.roles !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. ADMIN role required." },
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

    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid user IDs format or empty array" },
        { status: 400 }
      );
    }

    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        deletedCount: deleteResult.count,
        message: `Deleted ${deleteResult.count} user(s)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
