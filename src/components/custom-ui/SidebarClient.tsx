"use client";

import { FileText, LogOut, MessageCircleMore, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarClientProps {
  isMod: boolean;
}

export function SidebarClient({ isMod }: SidebarClientProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" && !pathname.startsWith("/admin");
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col gap-1 items-center p-2">
      {!isMod && (
        <Link href="/admin/users">
          <Button
            variant="ghost"
            size="lg"
            className={`w-12 h-12 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 text-foreground ${
              isActive("/admin/users") ? "bg-foreground/10" : ""
            }`}>
            <User className="!w-6 !h-6" />
          </Button>
        </Link>
      )}

      <Link href="/admin/docs">
        <Button
          variant="ghost"
          size="lg"
          className={`w-12 h-12 rounded-xl transition-all duration-200 text-foreground ${
            isActive("/admin/docs") ? "bg-foreground/10" : ""
          }`}>
          <FileText className="!w-6 !h-6" />
        </Button>
      </Link>

      <Link href="/">
        <Button
          variant="ghost"
          size="lg"
          className={`w-12 h-12 rounded-xl transition-all duration-200 text-foreground ${
            isActive("/") ? "bg-foreground/10" : ""
          }`}>
          <MessageCircleMore className="!w-6 !h-6" />
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
