import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/core/errors";
import type {
  ChatSessionMetadata,
  GetSessionContentOptions,
  UseChatHistoryAdapter,
} from "../types/chatHistoryTypes";
import type { ChatMessage } from "../types/chatTypes";

interface UseChatHistoryReturn<
  TMessage extends ChatMessage,
  TSessionMetadata extends ChatSessionMetadata,
> {
  deleteSession: (conversationId: string) => Promise<void>;
  error: Error | null;
  getSessionContent: (
    conversationId: string,
    options?: GetSessionContentOptions,
  ) => Promise<TMessage[]>;
  invalidateSessionContent: (conversationId?: string) => void;
  loading: boolean;
  renameSession: (conversationId: string, title: string) => Promise<void>;
  refetchMetadata: () => Promise<void>;
  sessions: TSessionMetadata[];
}

export const useChatHistory = <
  TMessage extends ChatMessage,
  TSessionMetadata extends ChatSessionMetadata,
>(
  adapter: UseChatHistoryAdapter<TMessage, TSessionMetadata>
): UseChatHistoryReturn<TMessage, TSessionMetadata> => {
  const contentCacheRef = useRef<Record<string, TMessage[]>>({});
  const contentRequestRef = useRef<Record<string, Promise<TMessage[]>>>({});
  const [sessions, setSessions] = useState<TSessionMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetchMetadata = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextSessions = await adapter.fetchSessions();
      setSessions(nextSessions);
    } catch (caughtError: unknown) {
      const resolvedError =
        caughtError instanceof Error
          ? caughtError
          : new Error(getErrorMessage(caughtError, "Failed to load chat history."));
      setError(resolvedError);
      throw resolvedError;
    } finally {
      setLoading(false);
    }
  }, [adapter]);

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
          const messages = await adapter.fetchSessionContent(conversationId);
          contentCacheRef.current[conversationId] = messages;
          return messages;
        } catch (caughtError: unknown) {
          const resolvedError =
            caughtError instanceof Error
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
    [adapter]
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

  const deleteSession = useCallback(
    async (conversationId: string) => {
      if (!adapter.deleteSession) {
        return;
      }

      await adapter.deleteSession(conversationId);
      delete contentCacheRef.current[conversationId];
      delete contentRequestRef.current[conversationId];
      await refetchMetadata();
    },
    [adapter, refetchMetadata]
  );

  const renameSession = useCallback(
    async (conversationId: string, title: string) => {
      if (!adapter.renameSession) {
        return;
      }

      await adapter.renameSession(conversationId, title);
      await refetchMetadata();
    },
    [adapter, refetchMetadata]
  );

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
