import {
  ChartArea,
  FileText,
  FileWarning,
  LogOut,
  MessageCircle,
  MessageCircleWarning,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";

export async function Sidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-col gap-1 items-center p-2">
      <Link href="/admin/users">
        <Button
          variant="ghost"
          size="lg"
          className="w-12 h-12 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 text-foreground">
          <User className="!w-6 !h-6" />
        </Button>
      </Link>

      <Link href="/admin/docs">
        <Button
          variant="ghost"
          size="lg"
          className="w-12 h-12 rounded-xl transition-all duration-200 bg-foreground/10 text-foreground">
          <FileText className="!w-6 !h-6" />
        </Button>
      </Link>

      <Link href="/admin/reports">
        <Button
          variant="ghost"
          size="lg"
          className="w-12 h-12 rounded-xl transition-all duration-200 text-foreground">
          <MessageCircleWarning className="!w-6 !h-6" />
        </Button>
      </Link>

      <Link href="/">
        <Button
          variant="ghost"
          size="lg"
          className="w-12 h-12 rounded-xl transition-all duration-200 text-foreground">
          <MessageCircle className="!w-6 !h-6" />
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="lg"
        className="w-12 h-12 rounded-xl transition-all duration-200 text-red-500 mt-auto">
        <LogOut className="!w-6 !h-6" />
      </Button>
    </div>
  );
}
