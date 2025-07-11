import { Bot, Loader2 } from "lucide-react";

export default function ChatLoadIndicator() {
  return (
    <div className="flex justify-start">
      <div className="border text-foreground px-4 py-2 rounded-lg rounded-tl-none max-w-xs">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    </div>
  );
}
