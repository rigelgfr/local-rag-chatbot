import ChatPage from "@/components/main/ChatPage";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <>{!session ? <p>login</p> : <ChatPage />}</>;
}
