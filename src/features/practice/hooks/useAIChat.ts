import { useChatStreaming } from "@/features/chat";
import { createChatSession, getAIExplanation } from "../api/practiceApi";
import type { AIExplanationResponse } from "../types/practiceTypes";
import type { AIChatMessage } from "../types/aiChatTypes";

interface UseAIChatOptions {
  conversationId: string | null;
  mode?: 0 | 1;
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
  streamMessage: (prompt: string, mode?: 0 | 1) => Promise<AIExplanationResponse & { conversationId: string }>;
}

export const useAIChat = ({
  conversationId,
  mode = 0,
  onConversationReady,
  onAssistantMessageStart,
  onAssistantMessageToken,
  onAssistantMessageComplete,
}: UseAIChatOptions): UseAIChatReturn => {
  const streamController = useChatStreaming<AIExplanationResponse>({
    conversationId,
    createConversation: createChatSession,
    stream: (prompt, options) => getAIExplanation(prompt, {
      conversationId: options.conversationId,
      mode: options.mode ?? mode,
      signal: options.signal,
      onToken: options.onToken,
      onComplete: options.onComplete,
    }),
    onConversationReady,
    onStreamStart: (assistantMessageId) => {
      onAssistantMessageStart?.({
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      });
    },
    onStreamToken: onAssistantMessageToken,
    onStreamComplete: (assistantMessageId, response) => {
      onAssistantMessageComplete?.(assistantMessageId, {
        ...response,
        explanation: response.explanation,
        conversationId: response.conversationId,
      });
    },
  });

  return {
    abortStream: streamController.abortStream,
    error: streamController.error,
    isStreaming: streamController.isStreaming,
    streamingMessageId: streamController.streamingMessageId,
    streamMessage: streamController.streamMessage,
  };
};