import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, RotateCcw, Pause } from "lucide-react";
import { useEffect, useRef } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        return;
      }

      if (inputRef.current) {
        inputRef.current.focus();

        if (e.key.length === 1) {
          setInput(input + e.key);
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, [input, setInput]);

  return (
    <div className="p-3 sm:mb-4 bg-background rounded-t-xl sm:rounded-xl border">
      <form
        onSubmit={onSendMessage}
        className="flex flex-col space-y-1 items-center">
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          autoFocus
          className="py-0 px-1 bg-background dark:bg-background border-none shadow-none focus:ring-none focus-visible:ring-0 text-sm sm:text-base"
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
            className="w-9 ml-auto bg-aquamarine-50 hover:bg-aquamarine-800 dark:bg-aquamarine dark:hover:bg-aquamarine-50 text-black-2">
            {isLoading ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
