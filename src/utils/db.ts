import { prisma } from "@/lib/prisma";

export async function findUserAuthDetails(userId: string) {
  const userWithAccount = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
      accounts: {
        where: {
          providerId: "microsoft",
        },
        select: {
          accessToken: true,
          refreshToken: true,
        },
      },
    },
  });

  if (!userWithAccount) {
    throw new Error("User not found");
  }

  const microsoftAccount = userWithAccount.accounts[0];

  return {
    role: userWithAccount.role,
    accessToken: microsoftAccount?.accessToken ?? null,
    refreshToken: microsoftAccount?.refreshToken ?? null,
  };
}
