import { decrypt, encrypt } from "@/lib/crypt";
import {
  refreshMicrosoftAccessToken,
  MicrosoftTokenResponse,
} from "./refresh-access-token";
import { prisma } from "@/lib/prisma";

interface TokenResult {
  accessToken: string;
  error?: string;
}

export async function getMicrosoftAccessToken(
  accountId: string
): Promise<TokenResult> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        accountId: accountId,
        providerId: "microsoft",
      },
      select: {
        id: true,
        accessToken: true,
        refreshToken: true,
        accessTokenExpiresAt: true,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    if (!account.accessToken || !account.refreshToken) {
      throw new Error("No tokens found for this account");
    }

    const now = new Date();
    const expiresAt = account.accessTokenExpiresAt;

    const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer
    const isExpired = !expiresAt || expiresAt <= bufferTime;

    if (isExpired) {
      const tokenResponse: MicrosoftTokenResponse =
        await refreshMicrosoftAccessToken(account.refreshToken);

      const newExpiresAt = new Date(
        now.getTime() + tokenResponse.expires_in * 1000
      );

      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: await encrypt(tokenResponse.access_token),
          accessTokenExpiresAt: newExpiresAt,
        },
      });

      return { accessToken: tokenResponse.access_token };
    } else {
      const decryptedAccessToken = await decrypt(account.accessToken);
      return { accessToken: decryptedAccessToken };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      accessToken: "",
      error: errorMessage,
    };
  }
}
