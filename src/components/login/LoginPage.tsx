"use client";

import { useState } from "react";
import { handleLogin } from "@/utils/auth";
import { Loading } from "@/components/custom-ui/Loading";
import { AnimatedLogo } from "../custom-ui/AnimatedLogo";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const desc = "ALVA's AI-powered assistant, built to answer your questions.";

  const onLoginClick = async () => {
    setIsLoading(true);
    await handleLogin("/");
  };

  if (isLoading) {
    return <Loading size="lg" />;
  }

  return (
    <main className="flex flex-col max-w-md sm:max-w-2xl p-8 mx-auto items-center justify-center h-full">
      <div className="relative z-10 mb-5">
        <AnimatedLogo />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl py-1 sm:text-5xl bg-gradient-to-r dark:from-aquamarine dark:to-[#13d4d4] from-aquamarine-800 to-[#007a7e] bg-clip-text text-transparent">
          Say Hi to <span className="font-semibold">AI-DOCU</span>
        </h1>
        <p className="text-muted-foreground italic text-md sm:text-lg mt-2">
          {desc}
        </p>
      </div>

      <div className="w-full space-y-4 flex flex-col gap-1 items-center mb-6">
        <button
          onClick={onLoginClick}
          className="w-full max-w-sm transition-transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-aquamarine focus:ring-offset-2 rounded">
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
        <p
          className="text-sm text-center cursor-pointer underline"
          onClick={onLoginClick}>
          Log in with an ALVA Microsoft account to get started.
        </p>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-12">
        <p>Secure authentication powered by Microsoft</p>
      </div>
    </main>
  );
}
