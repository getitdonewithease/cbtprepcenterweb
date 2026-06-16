import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/core/errors";
import { useSmoothStream } from "./useSmoothStreaming";
import type { UseChatStreamingOptions, UseChatStreamingExtendedResult } from "../types/chatStreamingTypes";

const defaultCreateMessageId = () => `assistant-${Date.now()}`;

export const useChatStreaming = <TResponse>({
  conversationId,
  createConversation,
  stream,
  onConversationReady,
  onStreamStart,
  onStreamToken,
  onStreamComplete,
  createMessageId = defaultCreateMessageId,
}: UseChatStreamingOptions<TResponse>): UseChatStreamingExtendedResult<TResponse> => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const { displayText, pushChunk, flush, reset, isAnimating } = useSmoothStream({
    charsPerTick: 3,
    intervalMs: 16,
  });

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setStreamingMessageId(null);
    reset();
  }, []);

  const streamMessage = useCallback(
    async (prompt: string, mode: 0 | 1 = 0) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const messageId = createMessageId();
      let accumulatedContent = "";

      setError(null);
      setIsStreaming(true);
      setStreamingMessageId(messageId);
      reset();
      onStreamStart?.(messageId);

      try {
        const resolvedConversationId = conversationId ?? await createConversation();

        if (resolvedConversationId !== conversationId) {
          onConversationReady?.(resolvedConversationId);
        }

        const response = await stream(prompt, {
          conversationId: resolvedConversationId,
          signal: controller.signal,
          mode,
          onToken: (chunk) => {
            accumulatedContent += chunk;
            pushChunk(chunk);
            onStreamToken?.(messageId, accumulatedContent, chunk);
          },
          onComplete: async (fullContent) => {
            accumulatedContent = fullContent;
            await flush();
          },
        });

        const resolvedResponse = {
          ...response,
          conversationId: resolvedConversationId,
        };

        onStreamComplete?.(messageId, resolvedResponse);
        return resolvedResponse;
      } catch (caughtError: unknown) {
        const resolvedError = caughtError instanceof Error
          ? caughtError
          : new Error(getErrorMessage(caughtError, "Failed to stream AI chat."));
        setError(resolvedError);
        throw resolvedError;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        setIsStreaming(false);
        setStreamingMessageId(null);
      }
    },
    [conversationId, createConversation, createMessageId, onConversationReady, onStreamComplete, onStreamStart, onStreamToken, stream]
  );

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  return {
    abortStream,
    error,
    isStreaming,
    streamingMessageId,
    streamMessage,
    displayText,
    isAnimating, 
  };
};
