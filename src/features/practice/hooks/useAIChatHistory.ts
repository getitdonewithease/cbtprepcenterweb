import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/core/errors";
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
  const contentCacheRef = useRef<Record<string, AIChatMessage[]>>({});
  const contentRequestRef = useRef<Record<string, Promise<AIChatMessage[]>>>({});
  const [sessions, setSessions] = useState<AIChatSessionMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetchMetadata = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const chats = await getAllChats();
      setSessions(chats.map(toSessionMetadata));
    } catch (caughtError: unknown) {
      const resolvedError = caughtError instanceof Error
        ? caughtError
        : new Error(getErrorMessage(caughtError, "Failed to load chat history."));
      setError(resolvedError);
      throw resolvedError;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionContent = useCallback(
    async (conversationId: string, options?: GetSessionContentOptions) => {
      if (!options?.force && contentCacheRef.current[conversationId]) {
        return contentCacheRef.current[conversationId];
      }

      if (!options?.force && contentRequestRef.current[conversationId]) {
        return contentRequestRef.current[conversationId];
      }

      const request = (async () => {
        try {
          const messages = await getChatContents(conversationId);
          contentCacheRef.current[conversationId] = messages;
          return messages;
        } catch (caughtError: unknown) {
          const resolvedError = caughtError instanceof Error
            ? caughtError
            : new Error(getErrorMessage(caughtError, "Failed to load chat contents."));
          setError(resolvedError);
          throw resolvedError;
        } finally {
          delete contentRequestRef.current[conversationId];
        }
      })();

      contentRequestRef.current[conversationId] = request;
      return request;
    },
    []
  );

  const invalidateSessionContent = useCallback((conversationId?: string) => {
    if (!conversationId) {
      contentCacheRef.current = {};
      contentRequestRef.current = {};
      return;
    }

    delete contentCacheRef.current[conversationId];
    delete contentRequestRef.current[conversationId];
  }, []);

  const deleteSession = useCallback(async (conversationId: string) => {
    await deleteChatSession(conversationId);
    delete contentCacheRef.current[conversationId];
    delete contentRequestRef.current[conversationId];
    await refetchMetadata();
  }, [refetchMetadata]);

  const renameSession = useCallback(async (conversationId: string, title: string) => {
    await renameChatSession(conversationId, title);
    await refetchMetadata();
  }, [refetchMetadata]);

  useEffect(() => {
    void refetchMetadata().catch(() => undefined);
  }, [refetchMetadata]);

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