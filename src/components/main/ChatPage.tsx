"use client";

import { useState } from "react";
import { Message } from "@/components/types";
import { sendChatMessage } from "@/utils/chat";
import ChatList from "@/components/main/ChatList";
import ChatInput from "@/components/main/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const outputText = await sendChatMessage(sessionId, input);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: outputText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Sorry, there was an error processing your message. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black-2">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <ChatList messages={messages} isLoading={isLoading} />
        </div>
      </div>
      <div className="flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            input={input}
            setInput={setInput}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
