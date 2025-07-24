import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { authClient } from "@/lib/auth-client";
import { findUserAuthDetails } from "./db";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypt";
import { refreshMicrosoftAccessToken } from "./graph-api/refresh-access-token";

export const auth = betterAuth({
  databaseHooks: {
    account: {
      create: {
        async before(account) {
          const withEncryptedTokens = { ...account };
          if (account.accessToken) {
            withEncryptedTokens.accessToken = encrypt(account.accessToken);
          }
          if (account.refreshToken) {
            withEncryptedTokens.refreshToken = encrypt(account.refreshToken);
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
        accessToken: authDetails.accessToken,
        refreshToken: authDetails.refreshToken,
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
      async refreshAccessToken(refreshToken) {
        const decryptedRefreshToken = decrypt(refreshToken);
        const tokenResponse = await refreshMicrosoftAccessToken(
          decryptedRefreshToken
        );
        return {
          accessToken: encrypt(tokenResponse.access_token),
          refreshToken: tokenResponse.refresh_token
            ? encrypt(tokenResponse.refresh_token)
            : undefined,
          expiresIn: tokenResponse.expires_in,
          tokenType: tokenResponse.token_type,
          scope: tokenResponse.scope,
        };
      },
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
