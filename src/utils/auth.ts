import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { authClient } from "@/lib/auth-client";
import { findUserAuthDetails } from "./db/custom-session";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypt";

export const auth = betterAuth({
  databaseHooks: {
    account: {
      create: {
        async before(account) {
          const resultAccount = { ...account };

          if (account.accessToken) {
            console.log("before:" + account.accessToken);
            const encryptedAccessToken = await encrypt(account.accessToken);
            console.log("after:" + encryptedAccessToken);
            resultAccount.accessToken = encryptedAccessToken;
          }
          if (account.refreshToken) {
            const encryptedRefreshToken = await encrypt(account.refreshToken);
            resultAccount.refreshToken = encryptedRefreshToken;
          }

          return Promise.resolve({
            data: resultAccount,
          });
        },
      },
      update: {
        async before(account) {
          const existingAccount = await prisma.account.findFirst({
            where: {
              accountId: account.accountId,
              providerId: account.providerId || "microsoft",
            },
            select: {
              accessToken: true,
              refreshToken: true,
            },
          });

          const withEncryptedTokens = { ...account };

          if (
            account.accessToken &&
            existingAccount?.accessToken !== account.accessToken
          ) {
            withEncryptedTokens.accessToken = await encrypt(
              account.accessToken
            );
          }

          if (
            account.refreshToken &&
            existingAccount?.refreshToken !== account.refreshToken
          ) {
            withEncryptedTokens.refreshToken = await encrypt(
              account.refreshToken
            );
          }

          return {
            data: withEncryptedTokens,
          };
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const authDetails = await findUserAuthDetails(session.userId);
      return {
        ...session,
        user: {
          roles: authDetails.role,
          ...user,
        },
        accountId: authDetails.accountId,
      };
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID as string,
      prompt: "select_account",
      scope: [
        "openid",
        "profile",
        "email",
        "https://graph.microsoft.com/Files.ReadWrite",
      ],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["USER", "ADMIN", "MOD"],
        required: true,
      },
    },
  },
  onAPIError: {
    throw: true,
    onError: (error) => {
      console.error("Auth error:", error);
    },
    errorURL: "/",
  },
});

export const handleLogin = async (callbackURL: string) => {
  try {
    await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: callbackURL,
    });
  } catch (error) {
    console.error("Login failed:", error);
  }
};

export const handleLogout = async () => {
  try {
    await authClient.signOut();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
