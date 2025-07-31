import AdminPageSection from "@/components/custom-ui/AdminPageSection";
import DocumentTable from "@/components/admin/docs/DocumentsTable";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.roles === "USER") {
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
