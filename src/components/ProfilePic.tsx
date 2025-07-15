"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { authClient } from "@/lib/auth-client";
import { UserIcon } from "lucide-react";
import { handleLogout } from "@/utils/auth";

export default function ProfilePic() {
  const { data } = authClient.useSession();
  const userImage = data?.user?.image;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage
            src={userImage ?? undefined}
            alt="User profile picture"
          />
          <AvatarFallback className="bg-foreground dark:bg-aquamarine text-background">
            <UserIcon className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-red-500"
          onClick={() => handleLogout("/")}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
