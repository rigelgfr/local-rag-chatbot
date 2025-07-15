import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function findUserRoles(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.role;
}
