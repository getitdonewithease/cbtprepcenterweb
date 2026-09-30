import api from "@/core/api/httpClient";
import { getErrorMessage } from "@/core/errors";
import {
  DailyChallengeStreakResponse,
  DailyChallengeStreakValue,
  DailyChallengeQuestionsResponse,
  DailyChallengeQuestionsValue,
  DailyChallengeSubmissionResponse,
  DailyChallengeSubmissionValue,
  DailyChallengeCompletionResponse,
  DailyChallengeCompletionValue,
  SubmitDailyChallengePayload,
} from "../types/dailyChallengeTypes";

/**
 * Fetches the student's streak stats and completion history for a given month.
 * @param month - Month formatted as "YYYY-MM" (e.g., "2026-09")
 */
export const getStudentStreak = async (month: string): Promise<DailyChallengeStreakValue> => {
  try {
    const response = await api.get<DailyChallengeStreakResponse>(
      "/api/v1/daily-challenges/students/streak",
      {
        params: { month },
      }
    );

    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    throw new Error(response.data?.message || "Failed to fetch streak information");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to load streak details"));
  }
};

/**
 * Fetches daily challenge questions for a given date.
 * Creates an InProgress completion if not started yet.
 * @param date - Date formatted as "YYYY-MM-DD"
 */
export const getDailyChallengeQuestions = async (
  date: string
): Promise<DailyChallengeQuestionsValue> => {
  try {
    const response = await api.get<DailyChallengeQuestionsResponse>(
      "/api/v1/daily-challenges/questions",
      {
        params: { date },
      }
    );

    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    throw new Error(response.data?.message || "Failed to fetch daily challenge questions");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to retrieve daily challenge questions"));
  }
};

/**
 * Submits the student's answers for a daily challenge.
 * @param dailyChallengeId - The ID of the daily challenge
 * @param payload - The submission payload containing questionAnswers
 */
export const submitDailyChallenge = async (
  dailyChallengeId: string,
  payload: SubmitDailyChallengePayload
): Promise<DailyChallengeSubmissionValue> => {
  try {
    const response = await api.post<DailyChallengeSubmissionResponse>(
      `/api/v1/daily-challenges/${dailyChallengeId}/submit`,
      payload
    );

    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    throw new Error(response.data?.message || "Failed to submit daily challenge");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to submit daily challenge"));
  }
};

/**
 * Fetches the completed daily challenge review for a given date.
 * Triggered when a challenge is Completed or LateCompletion.
 * @param date - Date formatted as "YYYY-MM-DD"
 */
export const getDailyChallengeCompletion = async (
  date: string
): Promise<DailyChallengeCompletionValue> => {
  try {
    const response = await api.get<DailyChallengeCompletionResponse>(
      "/api/v1/daily-challenges/completion",
      {
        params: { date },
      }
    );

    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    throw new Error(response.data?.message || "Failed to fetch daily challenge completion");
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to retrieve daily challenge completion details"));
  }
};

