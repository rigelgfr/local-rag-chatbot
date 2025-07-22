"use client";

import { useState } from "react";
import { handleLogin } from "@/utils/auth";
import { Loading } from "@/components/custom-ui/Loading";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const onLoginClick = async () => {
    setIsLoading(true);
    await handleLogin("/");
  };

  if (isLoading) {
    return <Loading size="lg" />;
  }

  return (
    <main className="flex flex-col gap-8 max-w-md sm:max-w-lg p-8 mx-auto items-center justify-center h-full">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome to ALVA AI
        </h1>
        <p className="text-muted-foreground text-sm sm:text-lg">
          Login with ALVA's Microsoft account to get started.
        </p>
      </div>

      <div className="w-full space-y-4">
        <button
          onClick={onLoginClick}
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
