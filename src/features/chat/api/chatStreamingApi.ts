import { getErrorMessage } from "@/core/errors";
import type { StreamChatApiRequest, StreamChatApiResponse } from "../types/chatStreamingTypes";

export const streamChatApiResponse = async ({
  prompt,
  chatId,
  baseUrl,
  token,
  endpointPath = "api/v1/ai/chat/stream",
  signal,
  mode = 0,
  onToken,
  onComplete,
}: StreamChatApiRequest): Promise<StreamChatApiResponse> => {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = `${normalizedBaseUrl}${endpointPath}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        prompt,
        chatId,
        mode,
      }),
      credentials: "include",
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let streamedContent = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const payload = line.replace(/\r$/, "");
        if (payload === "") {
          continue;
        }

        const normalized = payload.trim();
        if (normalized.startsWith("[DONE]")) {
          try {
            await reader.cancel();
          } catch {
            // Ignore reader cancellation errors on stream completion.
          }
          break;
        }

        const chunkContent = payload.replace(/\\n/g, "\n");
        streamedContent += chunkContent;
        onToken?.(chunkContent);
      }
    }

    onComplete?.(streamedContent);

    return {
      content: streamedContent,
      conversationId: chatId,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new Error(getErrorMessage(error, "Failed to stream AI response."));
  }
};
