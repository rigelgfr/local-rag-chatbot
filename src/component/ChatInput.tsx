import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, RotateCcw } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function ChatInput({
  input,
  setInput,
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  return (
    <div className="p-3 mb-4 bg-background rounded-xl border border-gray-200 dark:border-none">
      <form
        onSubmit={onSendMessage}
        className="flex flex-col space-y-1 items-center">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="py-0 px-1 bg-background dark:bg-background border-none shadow-none focus:ring-none focus-visible:ring-0"
        />

        <div className="flex w-full items-center gap-2">
          <Button
            variant="ghost"
            className="w-9 -ml-1 text-foreground dark:hover:bg-black-2">
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 ml-auto bg-aquamarine-50 hover:bg-aquamarine-800 dark:bg-aquamarine dark:hover:bg-aquamarine-50">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
