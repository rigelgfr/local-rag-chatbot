import UsersTable from "@/components/admin/users/UsersTable";
import AdminPageSection from "@/components/custom-ui/AdminPageSection";

export default function Page() {
  const desc =
    "Manage the chatbot users here. Add admins and mods by updating the user's role.";

  return (
    <AdminPageSection title="Users" desc={desc}>
      <UsersTable />
    </AdminPageSection>
  );
}
