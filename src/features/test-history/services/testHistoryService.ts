import { testHistoryApi } from "../api/testHistoryApi";
import { TestType, type TestRecord } from "../types/testHistoryTypes";

/**
 * The test history's rules. Every test is loaded (100 at a time), so the chart, the filters
 * and the count cover all of them, not only the page on screen. Results are said the way
 * the dashboard says them: a full test (Full UTME practice or Mock) out of 400, the sum of
 * its subject percentages; practice as the share of questions answered right.
 */

const PAGE_SIZE = 100;
/** A safety stop: 1,000 tests is far beyond any candidate's history so far. */
const MAX_PAGES = 10;

export type KindFilter = "all" | "full" | "practice";

export const KIND_LABEL: Record<TestType, string> = {
  [TestType.Custom]: "Custom practice",
  [TestType.Standard]: "Full UTME practice",
  [TestType.Mock]: "Mock",
};

export const kindOf = (test: TestRecord) => KIND_LABEL[test.type] ?? "Practice";

export const isFullTest = (test: TestRecord) => test.type === TestType.Standard || test.type === TestType.Mock;

export const isUnfinished = (test: TestRecord) => test.status === "in-progress" || test.status === "not-started";

export const outOf400 = (test: TestRecord) => Math.round(test.subjects.reduce((sum, s) => sum + s.percentage, 0));

export const percentRight = (test: TestRecord) =>
  test.numberOfQuestions > 0 ? Math.round((test.numberOfCorrect / test.numberOfQuestions) * 100) : 0;

/** "251 / 400" for a full test, "45%" for practice. */
export const resultOf = (test: TestRecord) => (isFullTest(test) ? `${outOf400(test)} / 400` : `${percentRight(test)}%`);

/** On the chart's 0-100 scale: a full test's marks ÷ 4, practice as % right. */
export const chartValueOf = (test: TestRecord) => (isFullTest(test) ? outOf400(test) / 4 : percentRight(test));

export const subjectsOf = (test: TestRecord) =>
  test.subjects.length === 4 ? "All four subjects" : test.subjects.map((s) => s.name).join(", ") || "No subjects";

export const finishedOldestFirst = (tests: TestRecord[]) =>
  tests.filter((t) => t.status === "submitted").sort((a, b) => a.createdOn.localeCompare(b.createdOn));

/** The test under way first, then any not yet started, newest first within each. */
export const unfinishedOf = (tests: TestRecord[]) =>
  tests
    .filter(isUnfinished)
    .sort((a, b) => (a.status === b.status ? b.createdOn.localeCompare(a.createdOn) : a.status === "in-progress" ? -1 : 1));

/** Every subject that appears in the history, for the subject menu. */
export const subjectsInHistory = (tests: TestRecord[]) =>
  [...new Set(tests.flatMap((t) => t.subjects.map((s) => s.name)))].sort((a, b) => a.localeCompare(b));

/** Finished and cancelled tests, narrowed by kind and subject, newest first. */
export const filterTests = (tests: TestRecord[], kind: KindFilter, subject: string) =>
  tests
    .filter((t) => !isUnfinished(t))
    .filter((t) => kind === "all" || (kind === "full" ? isFullTest(t) : !isFullTest(t)))
    .filter((t) => subject === "all" || t.subjects.some((s) => s.name === subject))
    .sort((a, b) => b.createdOn.localeCompare(a.createdOn));

export const testHistoryService = {
  async getAllTests(): Promise<TestRecord[]> {
    const tests: TestRecord[] = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const { items, totalPages } = await testHistoryApi.fetchPage(page, PAGE_SIZE);
      tests.push(...items);
      if (page >= totalPages || items.length === 0) break;
    }
    return tests;
  },

  cancelTest(testId: string) {
    return testHistoryApi.cancelTestSession(testId);
  },
};
