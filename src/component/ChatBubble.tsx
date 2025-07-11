import { Message } from "./types";

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}>
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
          message.sender === "user"
            ? "bg-aquamarine-800 dark:bg-aquamarine text-white dark:text-black-2 rounded-tr-none"
            : "border text-foreground rounded-tl-none"
        }`}>
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            <p
              className={`text-xs mt-1 ${
                message.sender === "user"
                  ? "text-background/75"
                  : "text-gray-500"
              }`}>
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
