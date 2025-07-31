import { Sidebar } from "@/components/custom-ui/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full mx-auto sm:gap-4 bg-white">
      <Sidebar />

      <div className="flex-1 flex justify-center h-full overflow-y-auto">
        <div className="w-full p-4 h-full">{children}</div>
      </div>
    </div>
  );
}
