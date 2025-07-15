import { Message } from "../types";

interface ChatBubbleProps {
  message: Message;
}

function formatText(text: string) {
  const lines = text.split("\n");

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.match(/^[*•\-]\s/)) {
      const bulletText = trimmedLine.replace(/^[*•\-]\s*/, "");
      const formattedBullet = formatInlineMarkdown(bulletText);
      return (
        <div key={index} className="flex items-start mb-1">
          <span className="mr-2 text-current">•</span>
          <span dangerouslySetInnerHTML={{ __html: formattedBullet }} />
        </div>
      );
    }

    const formattedLine = formatInlineMarkdown(line);
    return formattedLine ? (
      <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />
    ) : (
      <br key={index} />
    );
  });
}

function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
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
            ? "bg-aquamarine-800 dark:bg-aquamarine text-black-2 rounded-tr-none"
            : "bg-background border text-foreground rounded-tl-none"
        }`}>
        <div className="flex items-start space-x-2">
          <div className="flex-1">
            <div className="text-sm space-y-1">{formatText(message.text)}</div>
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
