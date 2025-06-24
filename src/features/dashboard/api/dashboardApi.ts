import api from "@/lib/apiConfig";

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
  if (res.data?.isSuccess && res.data.value?.subjectTestPerformances) {
    const subjectTestPerformances = res.data.value.subjectTestPerformances;
    const testMap: Record<string, any> = {};
    Object.entries(subjectTestPerformances).forEach(([subject, tests]) => {
      (tests as any[]).forEach((test) => {
        if (!testMap[test.testId]) {
          testMap[test.testId] = {
            testId: test.testId,
            dateTaken: test.dateTaken,
            subjects: [],
          };
        }
        testMap[test.testId].subjects.push({
          name: subject.charAt(0).toUpperCase() + subject.slice(1),
          score: test.score,
        });
      });
    });
    return Object.values(testMap).sort(
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

export const prepareTest = async (options: any) => {
  const res = await api.post("/api/v1/question/standered", options);
  if (res.data?.isSuccess && res.data.value?.cbtSessionId) {
    return res.data.value.cbtSessionId;
  }
  throw new Error(res.data?.message || "Failed to prepare questions");
};

export const fetchTestConfiguration = async (cbtSessionId: string) => {
  const res = await api.get(`/api/v1/cbtsessions/configuration/${cbtSessionId}`);
  if (res.data?.isSuccess && res.data.value) {
    return res.data.value;
  }
  throw new Error(res.data?.message || "Failed to fetch test configuration");
}; 