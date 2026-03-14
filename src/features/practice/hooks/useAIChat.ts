import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/core/errors";
import { createChatSession, getAIExplanation } from "../api/practiceApi";
import type { AIExplanationResponse } from "../types/practiceTypes";
import type { AIChatMessage } from "../types/aiChatTypes";

interface UseAIChatOptions {
  conversationId: string | null;
  onConversationReady?: (conversationId: string) => void;
  onAssistantMessageStart?: (message: AIChatMessage) => void;
  onAssistantMessageToken?: (messageId: string, nextContent: string, chunk: string) => void;
  onAssistantMessageComplete?: (messageId: string, response: AIExplanationResponse & { conversationId: string }) => void;
}

interface UseAIChatReturn {
  abortStream: () => void;
  error: Error | null;
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamMessage: (prompt: string) => Promise<AIExplanationResponse & { conversationId: string }>;
}

export const useAIChat = ({
  conversationId,
  onConversationReady,
  onAssistantMessageStart,
  onAssistantMessageToken,
  onAssistantMessageComplete,
}: UseAIChatOptions): UseAIChatReturn => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setStreamingMessageId(null);
  }, []);

  const streamMessage = useCallback(
    async (prompt: string) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const assistantMessageId = `assistant-${Date.now()}`;
      let accumulatedContent = "";

      setError(null);
      setIsStreaming(true);
      setStreamingMessageId(assistantMessageId);
      onAssistantMessageStart?.({
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      });

      try {
        const resolvedConversationId = conversationId ?? await createChatSession();

        if (resolvedConversationId !== conversationId) {
          onConversationReady?.(resolvedConversationId);
        }

        const response = await getAIExplanation(prompt, {
          conversationId: resolvedConversationId,
          signal: controller.signal,
          onToken: (chunk) => {
            accumulatedContent += chunk;
            onAssistantMessageToken?.(assistantMessageId, accumulatedContent, chunk);
          },
          onComplete: (fullContent) => {
            accumulatedContent = fullContent;
          },
        });

        const resolvedResponse = {
          ...response,
          explanation: accumulatedContent || response.explanation,
          conversationId: response.conversationId ?? resolvedConversationId,
        };

        onAssistantMessageComplete?.(assistantMessageId, resolvedResponse);
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
    [conversationId, onAssistantMessageComplete, onAssistantMessageStart, onAssistantMessageToken, onConversationReady]
  );

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  return {
    abortStream,
    error,
    isStreaming,
    streamingMessageId,
    streamMessage,
  };
};