import Link from "next/link";
import { Bot } from "lucide-react";
import { ThemeToggle } from "./ToggleUI";
import ProfilePic from "./ProfilePic";
import { Skeleton } from "../ui/skeleton";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { Suspense } from "react";

import LoginButton from "./MSLoginButton";
import Image from "next/image";

async function AuthSection() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return <ProfilePic />;
  }

  return <LoginButton />;
}

type HeaderProps = {
  size?: "short" | "full";
};

export default function Header({ size = "short" }: HeaderProps) {
  const containerClass = size === "full" ? "w-full" : "max-w-4xl";

  return (
    <header className="bg-white dark:bg-background border-b border-gray-200 dark:border-aquamarine px-4 py-3">
      <div className={`${containerClass} mx-auto flex gap-2 items-center`}>
        <Link href="/" className="flex items-center select-none">
          <img
            src="/logo/logo1.png"
            className="rounded-full h-6 mr-1"
            alt="Logo ALVA"
          />
          <h1 className="text-xl font-semibold text-foreground">AI-DOCU</h1>
        </Link>

        <ThemeToggle className="ml-auto" />
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
          <AuthSection />
        </Suspense>
      </div>
    </header>
  );
}
