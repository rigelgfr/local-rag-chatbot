import AdminPageSection from "@/components/custom-ui/AdminPageSection";
import UsersTable from "./UsersTable";

export default async function UsersPage() {
  const desc =
    "Manage the chatbot users here. Add admins and mods by updating the users' role.";

  return (
    <AdminPageSection title="Users" desc={desc}>
      <UsersTable />
    </AdminPageSection>
  );
}
