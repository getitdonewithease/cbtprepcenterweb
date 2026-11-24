/** One test session as the history shows it (mapped from GET /api/v1/cbtsessions). */

export type TestStatus = "not-started" | "in-progress" | "submitted" | "cancelled";

/** Matches the API's PracticeTestType. */
export enum TestType {
  Custom = 1,
  Standard = 2,
  Mock = 3,
}

export interface SubjectResult {
  name: string;
  /** Percentage of this subject's marks. */
  percentage: number;
  numberOfQuestions: number;
}

export interface TestRecord {
  id: string;
  /** ISO date-time the test was set up. */
  createdOn: string;
  type: TestType;
  status: TestStatus;
  subjects: SubjectResult[];
  numberOfQuestions: number;
  numberOfAttempted: number;
  numberOfCorrect: number;
  /** Seconds used so far. */
  secondsUsed: number;
}

export interface TestHistoryPage {
  items: TestRecord[];
  totalPages: number;
}
