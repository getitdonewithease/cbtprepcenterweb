export type ChatRole = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface ChatHistorySession {
  id: string;
  title: string;
  updatedAt: number;
}