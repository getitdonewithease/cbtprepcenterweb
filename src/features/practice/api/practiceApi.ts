// src/features/practice/api/practiceApi.ts
import api from "@/lib/apiConfig";
import { TestProgress, ProgressSaveOptions, TEST_STATUS, AIExplanationResponse } from "../types/practiceTypes";

/**
 * Fetches the questions for a given CBT session.
 * @param cbtSessionId - The ID of the CBT session.
 * @returns The questions for the test.
 */
export const getTestQuestions = async (cbtSessionId: string) => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.get(`/api/v1/cbtsessions/${cbtSessionId}/questions/paid`);
    if (response.data?.isSuccess && Array.isArray(response.data.value.groupedQuestionCommandQueryResponses)) {
      return response.data.value.groupedQuestionCommandQueryResponses;
    } else {
      throw new Error(response.data?.message || "Failed to fetch questions");
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to fetch questions");
  }
};

/**
 * Submits the answers for the test session.
 * @param sessionId - The ID of the CBT session.
 * @param questionAnswers - Array of { questionId, chosenOption }.
 * @param durationUsed - The duration used for the test (string).
 */
export const submitTestResults = async (
  sessionId: string,
  questionAnswers: Array<{ questionId: string; chosenOption: string }>,
  durationUsed: string
) => {
  try {
    const response = await api.post(`/api/v1/submissions/${sessionId}`, {
      questionAnswers,
      durationUsed,
    });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to submit test results");
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
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to fetch session configuration");
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
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to fetch test results");
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
    onToken?: (chunk: string) => void; // Receive streamed tokens
    signal?: AbortSignal; // Allow caller to cancel
  }
): Promise<AIExplanationResponse & { conversationId?: string } > => {
  const cid = options?.conversationId;
  var url = "";
  if (!cid) {
    url = `${api.defaults.baseURL}api/v1/ai/chat/stream`;
  }
  else {
    url = `${api.defaults.baseURL}api/v1/ai/chat/stream?chatId=${encodeURIComponent(cid)}`;
  }
  const controller = new AbortController();
  const signal = options?.signal ?? controller.signal;

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt }),
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let streamedContent = '';
    let buffer = '';
    let finalConversationId: string | undefined = undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '') continue;

        const payload = trimmed.startsWith('data: ')
          ? trimmed.substring(6)
          : trimmed;

        // DONE line may include conversation id
        if (payload.startsWith('[DONE]')) {
          const parts = payload.split(' ');
          if (parts.length > 1 && parts[1]) {
            finalConversationId = parts[1].trim();
          }
          try { await reader.cancel(); } catch {}
          break;
        }

        if (payload) {
          streamedContent += payload;
          streamedContent = streamedContent.replace(/\\n/g, '\n');
          if (options?.onToken) options.onToken(payload.replace(/\\n/g, '\n'));
        }
      }
    }

    // Best-effort simple parsing into AIExplanationResponse
    const result: AIExplanationResponse & { conversationId?: string } = {
      explanation: streamedContent,
      reasoning: '',
      tips: [],
      ...(finalConversationId ? { conversationId: finalConversationId } : {}),
    };

    return result;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      // Propagate a friendly abort error
      throw err;
    }
    throw new Error(err?.message || 'Failed to get AI explanation');
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
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`/api/v1/cbtsessions/${sessionId}/questions/${questionId}/save`);
    if (response.data?.isSuccess) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to save question");
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to save question");
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
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to fetch session details");
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
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    // Helper to convert answer index to letter (A, B, C, D...)
    const indexToLetter = (index: number) => String.fromCharCode(65 + index);
    
    // Convert answers to the expected format for the API
    const questionAnswers = Object.entries(progress.answers).map(([questionId, answerIndex]) => ({
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
  } catch (err: any) {
    // Don't throw errors for progress saves to avoid disrupting the test experience
    console.error('Failed to save test progress:', err.response?.data?.message || err.message);
    return { isSuccess: false, error: err.response?.data?.message || err.message };
  }
};

