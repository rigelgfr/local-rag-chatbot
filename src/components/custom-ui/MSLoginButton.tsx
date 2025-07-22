"use client";

import { handleLogin } from "@/utils/auth";

export default function LoginButton() {
  const onLoginClick = async () => {
    await handleLogin("/");
  };

  return (
    <button
      aria-label="Sign in with Microsoft"
      onClick={onLoginClick}
      className="hover:scale-120 transition-all duration-200">
      <img
        src="/login-button/ms-symbollockup_mssymbol_19.svg"
        alt="Sign in with Microsoft"
        className="h-full"
        loading="lazy"
      />
    </button>
  );
}
