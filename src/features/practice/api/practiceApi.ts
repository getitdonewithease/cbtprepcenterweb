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