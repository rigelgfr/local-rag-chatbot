import { Sidebar } from "@/components/custom-ui/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full mx-auto sm:gap-4">
      <Sidebar />

      <div className="flex-1 flex justify-center overflow-y-auto">
        <div className="w-full p-4">{children}</div>
      </div>
    </div>
  );
}
