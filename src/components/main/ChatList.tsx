import { useRef, useEffect } from "react";
import { Message } from "../types";
import ChatBubble from "./ChatBubble";
import ChatLoadIndicator from "./ChatLoadIndicator";
import EmptyState from "./EmptyState";

interface ChatListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatList({ messages, isLoading }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="p-4 space-y-4">
      {messages.length === 0 && <EmptyState />}

      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}

      {isLoading && <ChatLoadIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
