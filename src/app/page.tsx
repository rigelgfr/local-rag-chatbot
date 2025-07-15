"use client";

import ChatHeader from "@/components/Header";
import LoginPage from "@/components/login/LoginPage";
import ChatPage from "@/components/main/ChatPage";
import { authClient } from "@/lib/auth-client";
import { Loading } from "@/components/Loading";

export default function Page() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-black-2">
      <ChatHeader />

      {isPending ? <Loading /> : !session ? <LoginPage /> : <ChatPage />}
    </div>
  );
}
