export interface StreamChatApiRequest {
  prompt: string;
  chatId: string;
  baseUrl: string;
  token?: string | null;
  endpointPath?: string;
  signal?: AbortSignal;
  mode?: 0 | 1;
  onToken?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
}

export interface StreamChatApiResponse {
  content: string;
  conversationId: string;
}

export interface StreamRequestOptions {
  conversationId: string;
  signal: AbortSignal;
  mode?: 0 | 1;
  onToken?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
}

export interface UseChatStreamingOptions<TResponse> {
  conversationId: string | null;
  createConversation: () => Promise<string>;
  stream: (prompt: string, options: StreamRequestOptions) => Promise<TResponse>;
  onConversationReady?: (conversationId: string) => void;
  onStreamStart?: (messageId: string) => void;
  onStreamToken?: (messageId: string, nextContent: string, chunk: string) => void;
  onStreamComplete?: (messageId: string, response: TResponse & { conversationId: string }) => void;
  createMessageId?: () => string;
}

export interface UseChatStreamingExtendedResult<TResponse> {
  abortStream: () => void;
  error: Error | null;
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamMessage: (prompt: string, mode?: 0 | 1) => Promise<TResponse & { conversationId: string }>;
}

export interface UseChatStreamingResult<TResponse> {
  abortStream: () => void;
  error: Error | null;
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamMessage: (prompt: string) => Promise<TResponse & { conversationId: string }>;
}
