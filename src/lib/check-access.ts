import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function requireRoles(allowedRoles: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const role = session?.user?.roles;

  if (!session || !role || !allowedRoles.includes(role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return session;
}
