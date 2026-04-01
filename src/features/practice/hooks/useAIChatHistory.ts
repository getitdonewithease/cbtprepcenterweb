import { useMemo } from "react";
import { useChatHistory } from "@/features/chat";
import { deleteChatSession, getAllChats, getChatContents, renameChatSession } from "../api/practiceApi";
import type { AIChatMessage, AIChatSessionMetadata } from "../types/aiChatTypes";

interface GetSessionContentOptions {
  force?: boolean;
}

interface UseAIChatHistoryReturn {
  deleteSession: (conversationId: string) => Promise<void>;
  error: Error | null;
  getSessionContent: (conversationId: string, options?: GetSessionContentOptions) => Promise<AIChatMessage[]>;
  invalidateSessionContent: (conversationId?: string) => void;
  loading: boolean;
  renameSession: (conversationId: string, title: string) => Promise<void>;
  refetchMetadata: () => Promise<void>;
  sessions: AIChatSessionMetadata[];
}

const toSessionMetadata = (chat: { id: string; title: string; createdAt: Date }): AIChatSessionMetadata => ({
  id: `chat-${chat.id}`,
  title: chat.title,
  createdAt: chat.createdAt,
  updatedAt: chat.createdAt.getTime(),
  conversationId: chat.id,
});

export const useAIChatHistory = (): UseAIChatHistoryReturn => {
  const adapter = useMemo(
    () => ({
      fetchSessions: async () => {
        const chats = await getAllChats();
        return chats.map(toSessionMetadata);
      },
      fetchSessionContent: async (conversationId: string) => getChatContents(conversationId),
      deleteSession: async (conversationId: string) => {
        await deleteChatSession(conversationId);
      },
      renameSession: async (conversationId: string, title: string) => {
        await renameChatSession(conversationId, title);
      },
    }),
    [],
  );

  const {
    deleteSession,
    error,
    getSessionContent,
    invalidateSessionContent,
    loading,
    renameSession,
    refetchMetadata,
    sessions,
  } = useChatHistory<AIChatMessage, AIChatSessionMetadata>(adapter);

  return {
    deleteSession,
    error,
    getSessionContent,
    invalidateSessionContent,
    loading,
    renameSession,
    refetchMetadata,
    sessions,
  };
};