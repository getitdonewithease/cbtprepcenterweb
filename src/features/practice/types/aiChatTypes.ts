import type { ChatHistorySession, ChatMessage } from "@/features/chat";
import type { AIExplanationResponse } from "./practiceTypes";

export interface AIChatMessage extends ChatMessage {
  explanation?: AIExplanationResponse;
  timestamp: Date;
}

export interface AIChatSessionMetadata extends ChatHistorySession {
  createdAt: Date;
  conversationId: string | null;
}

export interface AIChatSession extends AIChatSessionMetadata {
  messages: AIChatMessage[];
}