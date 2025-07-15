import { Bot } from "lucide-react";
import { ThemeToggle } from "./ToggleUI";
import ProfilePic from "./ProfilePic";
import { authClient } from "@/lib/auth-client";
import { Skeleton } from "./ui/skeleton";

export default function ChatHeader() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="bg-white dark:bg-background border-b border-gray-200 dark:border-aquamarine px-4 py-3">
      <div className="max-w-4xl mx-auto flex gap-2 items-center">
        <div className="flex">
          <Bot className="w-6 h-6 text-aquamarine-50 dark:text-aquamarine mr-2" />
          <h1 className="text-xl font-semibold text-foreground">ALVA AI</h1>
        </div>

        <ThemeToggle className="ml-auto" />
        {isPending ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : session ? (
          <ProfilePic />
        ) : (
          <button aria-label="Sign in with Microsoft">
            <img
              src="/login-button/ms-symbollockup_mssymbol_19.svg"
              alt="Sign in with Microsoft"
              className="h-full"
              loading="lazy"
            />
          </button>
        )}
      </div>
    </header>
  );
}
