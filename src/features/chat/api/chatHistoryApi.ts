import api from "@/core/api/httpClient";
import { getAccessToken } from "@/core/auth/tokenStorage";
import { getErrorMessage } from "@/core/errors";
import { streamChatApiResponse } from "./chatStreamingApi";

interface BackendChatSummary {
  id: string;
  title: string;
  createdAt: Date;
}

interface BackendChatContent {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const createBackendChatSession = async (): Promise<string> => {
  try {
    const response = await api.post(`/api/v1/ai/chat`);
    const chatId = response.data?.value?.id;

    if (response.data?.isSuccess && typeof chatId === "string" && chatId.trim().length > 0) {
      return chatId;
    }

    throw new Error(response.data?.message || "Failed to create chat session");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create chat session"));
  }
};

export const getBackendChats = async (): Promise<BackendChatSummary[]> => {
  try {
    const res = await api.get(`/api/v1/ai/chat/history`);
    const chats = res.data?.value?.chats ?? res.data?.chats ?? res.data?.data;

    if (res.data?.isSuccess && Array.isArray(chats)) {
      return chats.map((chat: { id: string; title?: string; createdAt?: string }) => ({
        id: chat.id,
        title: chat.title || "New Chat",
        createdAt: chat.createdAt ? new Date(chat.createdAt) : new Date(),
      }));
    }

    throw new Error(res.data?.message || "Failed to fetch chats");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch chats"));
  }
};

export const getBackendChatContents = async (chatId: string): Promise<BackendChatContent[]> => {
  try {
    const res = await api.get(`/api/v1/ai/chat/${encodeURIComponent(chatId)}/content`);
    const contents = res.data?.value?.chatContents ?? res.data?.chatContents ?? res.data?.data;

    if (res.data?.isSuccess && Array.isArray(contents)) {
      return contents.map((content: { id?: string; role?: number; content?: string; createdAt?: string }, index: number) => ({
        id: content.id ?? `${chatId}-${index}`,
        role: content.role === 2 ? "assistant" : "user",
        content: content.content || "",
        timestamp: content.createdAt ? new Date(content.createdAt) : new Date(),
      }));
    }

    throw new Error(res.data?.message || "Failed to fetch chat contents");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch chat contents"));
  }
};

export const deleteBackendChatSession = async (chatId: string): Promise<void> => {
  try {
    const res = await api.delete(`/api/v1/ai/chat/__placeholder__/${encodeURIComponent(chatId)}`);
    if (!(res.data?.isSuccess ?? (res.status >= 200 && res.status < 300))) {
      throw new Error(res.data?.message || "Failed to delete chat session");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to delete chat session"));
  }
};

export const renameBackendChatSession = async (chatId: string, title: string): Promise<void> => {
  try {
    const res = await api.patch(`/api/v1/ai/chat/__placeholder__/${encodeURIComponent(chatId)}/title`, { title });
    if (!(res.data?.isSuccess ?? (res.status >= 200 && res.status < 300))) {
      throw new Error(res.data?.message || "Failed to rename chat session");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to rename chat session"));
  }
};

export const streamBackendChatMessage = async (
  prompt: string,
  chatId: string,
  options?: {
    signal?: AbortSignal;
    mode?: 0 | 1;
    onToken?: (chunk: string) => void;
    onComplete?: (fullContent: string) => void;
  }
) => {
  const token = getAccessToken();
  return streamChatApiResponse({
    prompt,
    chatId,
    baseUrl: api.defaults.baseURL ?? "",
    token,
    signal: options?.signal,
    mode: options?.mode,
    onToken: options?.onToken,
    onComplete: options?.onComplete,
  });
};
