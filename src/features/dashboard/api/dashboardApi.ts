import api from "@/lib/apiConfig";
import { PrepareTestPayload } from "../types/dashboardTypes";

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
      const { testPerformanceModel, subjectTestPerformances } = test;
      return {
        testId: testPerformanceModel.cbtSessionId,
        practiceTestType: testPerformanceModel.practiceTestType,
        dateTaken: testPerformanceModel.dateTaken,
        durationUsed: testPerformanceModel.durationUsed,
        averageSpeed: testPerformanceModel.averageSpeed,
        numberOfCorrectAnswers: testPerformanceModel.numberOfCorrectAnswers,
        numberOfQuestionsAttempted: testPerformanceModel.numberOfQuestionsAttempted,
        maxScore: testPerformanceModel.maxScore,
        subjects: subjectTestPerformances.map((subject) => ({
          name: subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1),
          score: subject.score,
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

export const prepareTest = async (options: PrepareTestPayload) => {
  try {
    const res = await api.post("/api/v1/questions/", options);
    if (res.data?.isSuccess && res.data.value?.cbtSessionId) {
      return res.data.value.cbtSessionId;
    }
    throw new Error(res.data?.message || "Failed to prepare questions");
  } catch (error: any) {
    let message = 'Failed to prepare questions';
    if (error?.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        message = firstKey;
      }
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }
    throw new Error(message);
  }
};

export const fetchTestConfiguration = async (cbtSessionId: string) => {
  const res = await api.get(`/api/v1/cbtsessions/configuration/${cbtSessionId}`);
  if (res.data?.isSuccess && res.data.value) {
    return res.data.value;
  }
  throw new Error(res.data?.message || "Failed to fetch test configuration");
}; 