import Chats from "@/components/admin/chats/Chats";
import AdminPageSection from "@/components/custom-ui/AdminPageSection";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.roles === "USER") {
    redirect("/");
  }

  const desc = "View users' chat sessions and history here.";

  return (
    <AdminPageSection title="Chat Sessions" desc={desc}>
      <Chats />
    </AdminPageSection>
  );
}
