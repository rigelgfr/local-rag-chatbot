"use client";

import UsersTable from "@/components/admin/users/UsersTable";
import AdminPageSection from "@/components/custom-ui/AdminPageSection";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function Page() {
  const { data: session } = authClient.useSession();

  if (!session) {
    console.log("Error: no session found");
    redirect("/");
  } else if (session.user.roles != "ADMIN" && session.user.roles === "MOD") {
    console.log("Error: unauthorized access");
    redirect("/admin/docs");
  }

  const desc =
    "Manage the chatbot users here. Add admins and mods by updating the users' role.";

  return (
    <AdminPageSection title="Users" desc={desc}>
      <UsersTable />
    </AdminPageSection>
  );
}
