import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { PrismaClient } from "@/generated/prisma";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { findUserRoles } from "./db";

const prisma = new PrismaClient();

export const auth = betterAuth({
  plugins: [
    customSession(async ({ user, session }) => {
      const roles = await findUserRoles(session.userId);
      return {
        user: {
          roles,
          ...user,
          session,
        },
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

export const handleLogout = async (callbackURL: string) => {
  try {
    await authClient.signOut();
    redirect(callbackURL);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
