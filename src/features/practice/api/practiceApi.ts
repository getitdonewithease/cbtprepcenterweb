// src/features/practice/api/practiceApi.ts
import api from "@/core/api/httpClient";
import { streamChatApiResponse } from "@/features/chat";
import { TestProgress, ProgressSaveOptions, TEST_STATUS, AIExplanationResponse } from "../types/practiceTypes";
import { getAccessToken } from "@/core/auth/tokenStorage";
import { getErrorMessage } from "@/core/errors";

export const createChatSession = async (): Promise<string> => {
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

/**
 * Fetches the questions for a given CBT session.
 * @param cbtSessionId - The ID of the CBT session.
 * @returns The questions for the test.
 */
export const getTestQuestions = async (cbtSessionId: string) => {
  try {
    const response = await api.get(`/api/v1/cbtsessions/${cbtSessionId}/questions/`);
    if (response.data?.isSuccess && Array.isArray(response.data.value.groupedQuestionCommandQueryResponses)) {
      return response.data.value.groupedQuestionCommandQueryResponses;
    } else {
      throw new Error(response.data?.message || "Failed to fetch questions");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch questions"));
  }
};

/**
 * Submits the answers for the test session.
 * @param sessionId - The ID of the CBT session.
 * @param questionAnswers - Array of { questionId, chosenOption }.
 * @param remainingTime - The remaining time on the countdown (HH:MM:SS format).
 */
export const submitTestResults = async (
  sessionId: string,
  questionAnswers: Array<{ questionId: string; chosenOption: string }>,
  remainingTime: string
) => {
  try {
    const response = await api.post(`/api/v1/submissions/${sessionId}`, {
      questionAnswers,
      remainingTime,
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to submit test results"));
  }
};

/**
 * Fetches the configuration for a given CBT session.
 * @param cbtSessionId - The ID of the CBT session.
 * @returns The configuration for the test session.
 */
export const getCbtSessionConfiguration = async (cbtSessionId: string) => {
  try {
    const response = await api.get(`/api/v1/cbtsessions/configuration/${cbtSessionId}`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    } else {
      throw new Error(response.data?.message || "Failed to fetch session configuration");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch session configuration"));
  }
}; 

/**
 * Fetches test results for review.
 * @param sessionId - The ID of the CBT session.
 * @returns The test results with questions and user answers.
 */
export const getTestResults = async (sessionId: string) => {
  try {
    const response = await api.get(`/api/v1/cbtsessions/${sessionId}/submissions/questions`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    } else {
      throw new Error(response.data?.message || "Failed to fetch test results");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch test results"));
  }
};

/**
 * Streams AI explanation/chat completion from the AI server for a given prompt.
 * @param prompt - The prompt string for the AI explanation.
 * @param options - Streaming options (conversation and callbacks).
 */
export const getAIExplanation = async (
  prompt: string,
  options?: {
    conversationId?: string | null;
    mode?: 0 | 1;
    onToken?: (chunk: string) => void; // Receive streamed tokens (raw, no markdown parsing)
    onComplete?: (fullContent: string) => void; // Called when streaming ends with complete content (ready for markdown)
    signal?: AbortSignal; // Allow caller to cancel
  }
): Promise<AIExplanationResponse & { conversationId: string } > => {
  const chatId = options?.conversationId ?? await createChatSession();
  const controller = new AbortController();
  const signal = options?.signal ?? controller.signal;

  try {
    const token = getAccessToken();
    const streamed = await streamChatApiResponse({
      prompt,
      chatId,
      baseUrl: api.defaults.baseURL ?? "",
      token,
      signal,
      mode: options?.mode ?? 0,
      onToken: options?.onToken,
      onComplete: options?.onComplete,
    });

    // Best-effort simple parsing into AIExplanationResponse
    const result: AIExplanationResponse & { conversationId: string } = {
      explanation: streamed.content,
      reasoning: '',
      tips: [],
      conversationId: streamed.conversationId,
    };

    return result;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Propagate a friendly abort error
      throw error;
    }
    throw new Error(getErrorMessage(error, 'Failed to get AI explanation'));
  } finally {
    // If we created our own controller, clean it up
    if (!options?.signal) {
      controller.abort();
    }
  }
};

/**
 * Saves a question to user's saved questions.
 * @param questionId - The ID of the question to save.
 * @returns Success response.
 */
export const saveQuestion = async (sessionId: string, questionId: string) => {
  try {
    const response = await api.post(`/api/v1/cbtsessions/${sessionId}/questions/${questionId}/save`);
    if (response.data?.isSuccess) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to save question");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to save question"));
  }
}; 

/**
 * Fetches the details for a given CBT session.
 * @param cbtSessionId - The ID of the CBT session.
 * @returns The session details object.
 */
export const getCbtSessionDetails = async (cbtSessionId: string) => {
  try {
    const response = await api.get(`/api/v1/cbtsessions/${cbtSessionId}`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    } else {
      throw new Error(response.data?.message || "Failed to fetch session details");
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch session details"));
  }
}; 

/**
 * Saves test progress using the submission endpoint.
 * @param progress - The test progress data to save.
 * @param options - Options for the save operation.
 * @returns Success response or throws error.
 */
export const saveTestProgress = async (
  progress: TestProgress, 
  options: ProgressSaveOptions = {}
) => {
  try {
    // Use provided questionAnswers if available; otherwise, fall back to index-based letters
    const indexToLetter = (index: number) => String.fromCharCode(65 + index);
    const questionAnswers = progress.questionAnswers && Array.isArray(progress.questionAnswers)
      ? progress.questionAnswers
      : Object.entries(progress.answers).map(([questionId, answerIndex]) => ({
          questionId,
          chosenOption: typeof answerIndex === "number" ? indexToLetter(answerIndex) : 'X',
        }));
    
    // Prepare the payload according to the correct API structure
    const payload = {
      questionAnswers,
      remainingTime: progress.remainingTime
    };
    
    // Use appropriate status: In-Progress for progress saves, Completed for final submission
    const status = progress.isProgressSave ? TEST_STATUS.IN_PROGRESS : TEST_STATUS.SUBMITTED;
    
    const response = await api.put(`/api/v1/submissions/${progress.sessionId}?status=${status}`, payload);
    return response.data;
  } catch (error: unknown) {
    // Don't throw errors for progress saves to avoid disrupting the test experience
    const message = getErrorMessage(error, 'Failed to save test progress');
    console.error('Failed to save test progress:', message);
    return { isSuccess: false, error: message };
  }
};

/**
 * Fetches all chat sessions (ids, titles, createdAt) for the current user.
 */
export const getAllChats = async (): Promise<Array<{ id: string; title: string; createdAt: Date }>> => {
  try {
    const res = await api.get(`/api/v1/ai/chat/history`);
    const chats = res.data?.value?.chats ?? res.data?.chats ?? res.data?.data;
    if (res.data?.isSuccess && Array.isArray(chats)) {
      return chats.map((c: any) => ({
        id: c.id,
        title: c.title || 'New Chat',
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      }));
    }

    throw new Error(res.data?.message || "Failed to fetch chats");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch chats"));
  }
};

/**
 * Fetches all messages for a specific chatId.
 * Maps roles 1 -> 'user', 2 -> 'assistant'.
 * For user messages, attempts to strip any leading question reference prefix.
 */
export const getChatContents = async (
  chatId: string
): Promise<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>> => {
  try {
    const res = await api.get(`/api/v1/ai/chat/${encodeURIComponent(chatId)}/content`);
    const contents = res.data?.value?.chatContents ?? res.data?.chatContents ?? res.data?.data;
    if (res.data?.isSuccess && Array.isArray(contents)) {
      const stripPrefix = (text: string): string => {
        const t = text || '';
        const startsWithRef = t.trim().toLowerCase().startsWith('question reference');
        if (!startsWithRef) return t;
        const marker = '\n\n';
        const lastIdx = t.lastIndexOf(marker);
        if (lastIdx === -1) return t;
        return t.substring(lastIdx + marker.length).trim();
      };

      return contents.map((c: any, idx: number) => {
        const role: 'user' | 'assistant' = c.role === 2 ? 'assistant' : 'user';
        const raw = c.content || '';
        const content = role === 'user' ? stripPrefix(raw) : raw;
        return {
          id: `${chatId}-${idx}`,
          role,
          content,
          timestamp: new Date(),
        };
      });
    }

    throw new Error(res.data?.message || "Failed to fetch chat contents");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch chat contents"));
  }
};

/**
 * Fetches only the latest chat content for a specific chatId.
 * Returns assistant/user role mapping as 2 -> 'assistant', 1 -> 'user'.
 */
export const getLastChatContent = async (
  chatId: string
): Promise<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }> => {
  try {
    const res = await api.get(`/api/v1/ai/chat/${encodeURIComponent(chatId)}/lastchatcontent`);
    const payload =
      res.data?.value?.chatContent ??
      res.data?.value?.lastChatContent ??
      res.data?.value ??
      res.data?.chatContent ??
      res.data?.lastChatContent ??
      res.data?.data;

    if (res.data?.isSuccess && payload) {
      const role: 'user' | 'assistant' = payload.role === 2 ? 'assistant' : 'user';
      return {
        id: `${chatId}-last-${payload.id ?? Date.now()}`,
        role,
        content: payload.content || '',
        timestamp: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      };
    }

    throw new Error(res.data?.message || 'Failed to fetch last chat content');
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch last chat content'));
  }
};

/**
 * Placeholder endpoint for deleting a chat session.
 * Replace this URL with the real backend route when available.
 */
export const deleteChatSession = async (chatId: string) => {
  try {
    const res = await api.delete(`/api/v1/ai/chat/__placeholder__/${encodeURIComponent(chatId)}`);
    if (res.data?.isSuccess ?? (res.status >= 200 && res.status < 300)) {
      return res.data;
    }

    throw new Error(res.data?.message || "Failed to delete chat session");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to delete chat session"));
  }
};

/**
 * Placeholder endpoint for renaming a chat session.
 * Replace this URL with the real backend route when available.
 */
export const renameChatSession = async (chatId: string, title: string) => {
  try {
    const res = await api.patch(`/api/v1/ai/chat/__placeholder__/${encodeURIComponent(chatId)}/title`, { title });
    if (res.data?.isSuccess ?? (res.status >= 200 && res.status < 300)) {
      return res.data;
    }

    throw new Error(res.data?.message || "Failed to rename chat session");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to rename chat session"));
  }
};

