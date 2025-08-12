export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export interface n8nMessage {
  type: "human" | "ai";
  content: string;
  additional_kwargs?: string;
  response_metadata?: string[];
}

export interface ChatMessage {
  id: number;
  messages: n8nMessage[];
  created_at: string;
}
