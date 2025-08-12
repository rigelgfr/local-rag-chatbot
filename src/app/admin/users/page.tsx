import UsersPage from "@/components/admin/users/UsersPage";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    console.log("Error: no session found");
    redirect("/");
  } else if (session.user.roles === "MOD") {
    console.log("Error: unauthorized access");
    redirect("/admin/docs");
  } else if (session.user.roles === "USER") {
    console.log("Error: unauthorized access");
    redirect("/");
  }

  return <UsersPage />;
}
