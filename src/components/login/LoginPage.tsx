"use client";

import { handleLogin } from "@/utils/auth";

export default function LoginPage() {
  return (
    <main className="flex flex-col gap-8 max-w-md p-8 mx-auto items-center justify-center h-full">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to ALVA AI
        </h1>
        <p className="text-muted-foreground text-lg">
          Login to chat with ALVA's AI Assistant
        </p>
      </div>

      <div className="w-full space-y-4">
        <button
          onClick={() => handleLogin("/")}
          className="w-full transition-transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-aquamarine focus:ring-offset-2 rounded">
          <img
            src="/login-button/ms-symbollockup_signin_dark.svg"
            alt="Sign in with Microsoft"
            className="w-full h-auto dark:hidden"
          />
          <img
            src="/login-button/ms-symbollockup_signin_light.svg"
            alt="Sign in with Microsoft"
            className="w-full h-auto hidden dark:block"
          />
        </button>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Secure authentication powered by Microsoft</p>
      </div>
    </main>
  );
}
