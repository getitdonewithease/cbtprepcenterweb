// src/features/practice/api/practiceApi.ts
import api from "@/lib/apiConfig";

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
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
 * Gets AI explanation for a specific question.
 * @param request - The AI explanation request containing question details.
 * @returns The AI explanation response.
 */
export const getAIExplanation = async (request: {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}) => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`/api/v1/ai/explain-question`, request);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    } else {
      throw new Error(response.data?.message || "Failed to get AI explanation");
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to get AI explanation");
  }
};

/**
 * Saves a question to user's saved questions.
 * @param questionId - The ID of the question to save.
 * @returns Success response.
 */
export const saveQuestion = async (questionId: string) => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.post(`/api/v1/questions/${questionId}/save`);
    if (response.data?.isSuccess) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to save question");
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to save question");
  }
}; 