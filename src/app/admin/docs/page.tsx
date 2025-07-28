"use client";

import AdminPageSection from "@/components/custom-ui/AdminPageSection";
import DocumentTable from "@/components/admin/docs/DocumentsTable";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function Page() {
  const { data: session } = authClient.useSession();

  if (!session) {
    console.log("Error: no session found");
    redirect("/");
  } else if (session.user.roles === "USER") {
    console.log("Error: unauthorized access");
    redirect("/");
  }

  const desc =
    "Manage ALVA AI's knowledge base by adding, updating, or deleting documents here. To update a document, simply upload a new version with the same name. The database will take a few minutes to process the changes, and the AI will be able to access the updated information. Note that any changes made will be reflected in the AI's responses.";

  return (
    <AdminPageSection title="Documents" desc={desc}>
      <DocumentTable />
    </AdminPageSection>
  );
}
