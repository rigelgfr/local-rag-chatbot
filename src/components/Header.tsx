import { Bot } from "lucide-react";
import { ThemeToggle } from "./ToggleUI";

export default function ChatHeader() {
  return (
    <header className="bg-white dark:bg-background border-b border-gray-200 dark:border-aquamarine px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center">
        <Bot className="w-6 h-6 text-aquamarine-50 dark:text-aquamarine mr-2" />
        <h1 className="text-xl font-semibold text-foreground">ALVA AI</h1>
        <ThemeToggle className="ml-auto" />
      </div>
    </header>
  );
}
