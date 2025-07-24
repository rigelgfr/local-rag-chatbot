import DocumentTable from "@/components/docs/DocumentsTable";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <h1 className="text-3xl font-semibold">Documents</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Manage ALVA AI's knowledge base. Add, update, or delete documents here.
        Note that any changes made will be reflected in the AI's responses.
      </p>
      <Separator className="my-2" />
      <DocumentTable />
      <div></div>
    </div>
  );
}
