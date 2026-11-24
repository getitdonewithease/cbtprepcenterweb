import api from "@/core/api/httpClient";
import { getErrorMessage } from "@/core/errors";
import { subjectLabel } from "@/core/utils/subjectLabel";
import type { TestHistoryPage, TestRecord, TestStatus } from "../types/testHistoryTypes";

/** HTTP only: the student's test sessions, newest first, and cancelling one. */

interface SubjectScoreResponse {
  subject: string;
  score: number;
  maxScore: number;
  percentageScore?: number;
  numberOfQuestions?: number;
}

interface CbtSessionResponse {
  id: string;
  createdOn: string;
  practiceTestType: number;
  cbtSessionStatus: number;
  numberOfQuestion: number;
  numberOfQuestionAttempted: number;
  numberOfCorrectAnswers: number;
  durationUsed: string;
  subjectScore: SubjectScoreResponse[];
}

const STATUS: Record<number, TestStatus> = { 1: "not-started", 2: "in-progress", 3: "submitted", 4: "cancelled" };

/** "01:53:07" (or "00:00:07.5") as seconds. */
const toSeconds = (duration?: string) => {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  return Math.floor(parts.reduce((total, part) => total * 60 + part, 0));
};

const toRecord = (item: CbtSessionResponse): TestRecord => ({
  id: item.id,
  createdOn: item.createdOn,
  type: item.practiceTestType || 1,
  status: STATUS[item.cbtSessionStatus] ?? "not-started",
  subjects: (item.subjectScore ?? []).map((s) => ({
    name: subjectLabel(s.subject),
    percentage: s.percentageScore ?? (s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0),
    numberOfQuestions: s.numberOfQuestions ?? 0,
  })),
  numberOfQuestions: item.numberOfQuestion ?? 0,
  numberOfAttempted: item.numberOfQuestionAttempted ?? 0,
  numberOfCorrect: item.numberOfCorrectAnswers ?? 0,
  secondsUsed: toSeconds(item.durationUsed),
});

export const testHistoryApi = {
  async fetchPage(pageNumber: number, pageSize: number): Promise<TestHistoryPage> {
    try {
      const res = await api.get("/api/v1/cbtsessions/", { params: { pageNumber, pageSize } });
      if (!res.data?.isSuccess) throw new Error(res.data?.message || "Failed to fetch test history");
      return {
        items: (res.data.value.items as CbtSessionResponse[]).map(toRecord),
        totalPages: res.data.value.metaData?.totalPages || 1,
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Failed to fetch test history"));
    }
  },

  async cancelTestSession(cbtSessionId: string): Promise<void> {
    try {
      const res = await api.put(`/api/v1/cbtsessions/${cbtSessionId}`, "Cancel", {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.data?.isSuccess) throw new Error(res.data?.message || "Failed to cancel test session");
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, "Failed to cancel test session"));
    }
  },
};
