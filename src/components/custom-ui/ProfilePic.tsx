"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { authClient } from "@/lib/auth-client";
import { UserIcon } from "lucide-react";
import { handleLogout } from "@/utils/auth";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";

export default function ProfilePic() {
  const router = useRouter();
  const { data } = authClient.useSession();
  const userImage = data?.user?.image;
  const userName = data?.user.name;
  const userEmail = data?.user.email;
  const userRole = data?.user.roles;

  const handleAdminClick = () => {
    router.push("/admin/docs");
  };

  const onLogoutClick = async () => {
    await handleLogout();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage
            src={userImage ?? undefined}
            alt="User profile picture"
          />
          <AvatarFallback className="bg-foreground dark:bg-aquamarine text-background">
            <UserIcon className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 space-y-1">
        {userName && userEmail && (
          <div className="flex flex-col p-2">
            <span className="text-sm font-medium truncate">{userName}</span>
            <span className="underline text-xs text-gray-400 truncate">
              {userEmail}
            </span>
          </div>
        )}
        <Separator />
        {userRole === "ADMIN" && (
          <>
            <DropdownMenuItem
              onClick={handleAdminClick}
              className="cursor-pointer">
              Admin Panel
            </DropdownMenuItem>
            <Separator />
          </>
        )}
        <DropdownMenuItem onSelect={onLogoutClick} className="cursor-pointer">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
