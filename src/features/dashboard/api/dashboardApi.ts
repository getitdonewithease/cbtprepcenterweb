import api from "@/lib/apiConfig";
import { PrepareTestPayload } from "../types/dashboardTypes";
import { AppError, DomainError } from "@/core/errors";

export const fetchUserProfile = async () => {
  const res = await api.get("/api/v1/students/me");
  if (res.data?.isSuccess && res.data.value) {
    return {
      ...res.data.value,
      studentId: res.data.value.studentId?.value || res.data.value.studentId,
    };
  }
  throw new Error(res.data?.message || "Failed to fetch user profile");
};

export const fetchRecentTests = async () => {
  const res = await api.get("/api/v1/dashboard/students/test-performance");
  if (res.data?.isSuccess && res.data.value?.testPerformances) {
    const testPerformances = res.data.value.testPerformances;
    return testPerformances.map((test) => {
      const { testPerformanceModel, testSubjectPerformances } = test;
      return {
        testId: testPerformanceModel.cbtSessionId,
        practiceTestType: testPerformanceModel.practiceTestType,
        dateTaken: testPerformanceModel.dateTaken,
        durationUsed: testPerformanceModel.durationUsed,
        averageSpeed: testPerformanceModel.averageSpeed,
        numberOfCorrectAnswers: testPerformanceModel.numberOfCorrectAnswers,
        numberOfQuestionsAttempted: testPerformanceModel.numberOfQuestionsAttempted,
        maxScore: testPerformanceModel.maxScore,
        totalScorePercentage: testPerformanceModel.totalScorePercentage,
        subjects: testSubjectPerformances.map((subject) => ({
          name: subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1),
          score: subject.score,
          scorePercentage: subject.scorePercentage,
        })),
      };
    }).sort(
      (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
    );
  }
  throw new Error(res.data?.message || "Failed to fetch recent tests");
};

export const fetchSubjectPerformance = async () => {
  const res = await api.get("/api/v1/dashboard/students/aggregate-performance");
  if (res.data?.isSuccess && res.data.value?.subjectsPerformanceAnalysis) {
    return res.data.value.subjectsPerformanceAnalysis;
  }
  throw new Error(res.data?.message || "Failed to fetch subject performance");
};

export const fetchLowConfidenceTopics = async () => {
  const res = await api.get(
    "/api/v1/students/me/confidences?confidenceLevel=All",
  );
  if (res.data?.isSuccess && res.data.value?.confidences) {
    return res.data.value.confidences;
  }
  throw new Error(res.data?.message || "Failed to fetch topic confidences");
};

export const prepareTest = async (options: PrepareTestPayload) => {
  try {
    const res = await api.post("/api/v1/questions/", options);
    if (res.data?.isSuccess && res.data.value?.cbtSessionId) {
      return res.data.value.cbtSessionId;
    }
    throw new Error(res.data?.message || "Failed to prepare questions");
  } catch (error: unknown) {
    if (error instanceof DomainError) {
      const firstDetailKey = Object.keys(error.details)[0];
      throw new Error(firstDetailKey ?? error.message);
    }

    if (error instanceof AppError) {
      throw new Error(error.message);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to prepare questions");
  }
};

export const fetchTestConfiguration = async (cbtSessionId: string) => {
  const res = await api.get(`/api/v1/cbtsessions/configuration/${cbtSessionId}`);
  if (res.data?.isSuccess && res.data.value) {
    return res.data.value;
  }
  throw new Error(res.data?.message || "Failed to fetch test configuration");
}; 