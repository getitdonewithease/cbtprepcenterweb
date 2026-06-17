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
      body: JSON.stringify({ prompt, chatId, mode }),
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
    let done = false;

    while (!done) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by double newlines
      const events = buffer.split("\n\n");

      // The last element may be an incomplete event — keep it in the buffer
      buffer = events.pop() ?? "";

      for (const event of events) {
        if (!event.trim()) continue;

        // Parse all lines of this SSE event block
        const lines = event.split("\n");
        let eventType = "message";
        let dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.slice("event:".length).trim(); // safe to trim — it's a keyword
          } else if (line.startsWith("data:")) {
            const raw = line.slice("data:".length);
            // Strip only the single leading space per SSE spec — never trim() content
            dataLines.push(raw.startsWith(" ") ? raw.slice(1) : raw);
          }
        }

        const data = dataLines.join("\n");

        // Your backend sends eventType "done" as the terminal signal
        if (eventType === "done") {
          done = true;
          try {
            await reader.cancel();
          } catch {
            // Ignore cancellation errors on stream completion
          }
          break;
        }

        if (!data) continue;

        const chunkContent = data;
        streamedContent += chunkContent;
        onToken?.(chunkContent);
      }
    }

    await onComplete?.(streamedContent);

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