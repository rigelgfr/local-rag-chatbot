import { requireRoles } from "@/lib/check-access";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;

  const sessionOrResponse = await requireRoles(["USER", "MOD", "ADMIN"]);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  await prisma.chat_history.deleteMany({
    where: { session_id: sessionId },
  });

  return NextResponse.json({ success: true });
}
