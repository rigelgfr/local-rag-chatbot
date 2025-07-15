import { authClient } from "@/lib/auth-client";
import { Bot } from "lucide-react";

export default function EmptyState() {
  const { data: session } = authClient.useSession();
  const userName = session?.user.name;

  return (
    <div className="flex flex-col justify-center items-center text-gray-400 mt-8">
      <Bot className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
      <h1 className="text-lg sm:text-3xl font-semibold mb-1">
        Hello, <span className="text-foreground">{userName}!</span>
      </h1>
      <p className="text-sm sm:text-base">
        Start a conversation with the AI assistant
      </p>
    </div>
  );
}
