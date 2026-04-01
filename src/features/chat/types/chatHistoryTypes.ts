import type { ChatHistorySession, ChatMessage } from "./chatTypes";

export interface ChatSessionMetadata extends ChatHistorySession {
  conversationId: string | null;
  createdAt?: Date;
}

export interface ChatSession<TMessage extends ChatMessage = ChatMessage>
  extends ChatSessionMetadata {
  messages: TMessage[];
}

export interface GetSessionContentOptions {
  force?: boolean;
}

export interface UseChatHistoryAdapter<
  TMessage extends ChatMessage = ChatMessage,
  TSessionMetadata extends ChatSessionMetadata = ChatSessionMetadata,
> {
  fetchSessions: () => Promise<TSessionMetadata[]>;
  fetchSessionContent: (conversationId: string) => Promise<TMessage[]>;
  deleteSession?: (conversationId: string) => Promise<void>;
  renameSession?: (conversationId: string, title: string) => Promise<void>;
}
