import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { authClient } from "@/lib/auth-client";
import { findUserAuthDetails } from "./db/custom-session";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypt";

export const auth = betterAuth({
  // databaseHooks: {
  //   account: {
  //     create: {
  //       before(account) {
  //         const withEncryptedTokens = { ...account };

  //         if (account.accessToken) {
  //           const encryptedAccessToken = encrypt(account.accessToken);
  //           withEncryptedTokens.accessToken = encryptedAccessToken;
  //         }
  //         if (account.refreshToken) {
  //           const encryptedRefreshToken = encrypt(account.refreshToken);
  //           withEncryptedTokens.refreshToken = encryptedRefreshToken;
  //         }
  //         return Promise.resolve({
  //           data: withEncryptedTokens,
  //         });
  //       },
  //     },
  //   },
  // },
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
    onError: (error, _ctx) => {
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
