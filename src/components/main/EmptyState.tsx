import { Bot } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col justify-center items-center text-gray-500 dark:text-gray-300 mt-8">
      <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-white" />
      <p>Start a conversation with the AI assistant</p>
    </div>
  );
}
