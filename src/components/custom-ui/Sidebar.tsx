import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { SidebarClient } from "./SidebarClient";

export async function Sidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isMod = session?.user?.roles === "MOD";

  return <SidebarClient isMod={isMod} />;
}
