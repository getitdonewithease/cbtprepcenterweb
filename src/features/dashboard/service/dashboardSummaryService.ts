import type { CalendarDayModel } from "@/features/daily-challenge";
import {
  PracticeTestType,
  type RecentTest,
  type SubjectPerformance,
  type TopicConfidence,
} from "../types/dashboardTypes";

/**
 * Business rules for the dashboard: where the score out of 400 comes from, what to study
 * next, how the daily-challenge month is counted, and how recent tests are described.
 * Pure functions, so the rules are testable without React or the network.
 */

export const DEFAULT_TARGET = 250;
export const UTME_MAX = 400;

const SUBJECT_LABELS: Record<string, string> = {
  english: "Use of English",
  "use of english": "Use of English",
  mathematics: "Mathematics",
  maths: "Mathematics",
};

export const subjectLabel = (raw: string): string => {
  const key = raw.trim().toLowerCase();
  return SUBJECT_LABELS[key] ?? key.replace(/\b\w/g, (c) => c.toUpperCase());
};

const sameSubject = (a: string, b: string) => subjectLabel(a) === subjectLabel(b);

/** A test that sits all four subjects, like the real UTME, and so has a score out of 400. */
export const isFullTest = (test: RecentTest) =>
  test.practiceTestType === PracticeTestType.Standard || test.practiceTestType === PracticeTestType.Mock;

const byNewest = (a: RecentTest, b: RecentTest) => b.dateTaken.localeCompare(a.dateTaken);

/** Score out of 400: the four subject marks (each out of 100) added up, as JAMB does. */
export const fullTestTotal = (test: RecentTest) =>
  Math.round(test.subjects.reduce((sum, s) => sum + (s.scorePercentage ?? 0), 0));

// ── Score ────────────────────────────────────────────────────────────────────

export interface SubjectMark {
  subject: string;
  /** Out of 100; null when the candidate has no result in this subject yet. */
  mark: number | null;
}

export type ScoreSummary =
  | {
      /** The latest full UTME practice: a real score out of 400. */
      kind: "full-test";
      total: number;
      change: number | null;
      takenOn: string;
      testId: string;
      subjects: SubjectMark[];
      target: number;
    }
  | {
      /** No full test yet: per-subject averages from practice, and deliberately no total. */
      kind: "practice";
      subjects: SubjectMark[];
      target: number;
    }
  | {
      /** Nothing taken yet. */
      kind: "none";
      subjects: SubjectMark[];
      target: number;
    };

export const buildScoreSummary = (
  courses: string[],
  recentTests: RecentTest[],
  aggregate: SubjectPerformance[],
  targetScore: number | null | undefined,
): ScoreSummary => {
  const target = targetScore && targetScore > 0 ? targetScore : DEFAULT_TARGET;
  const fullTests = recentTests.filter(isFullTest).sort(byNewest);
  const [latest, previous] = fullTests;

  if (latest) {
    return {
      kind: "full-test",
      total: fullTestTotal(latest),
      change: previous ? fullTestTotal(latest) - fullTestTotal(previous) : null,
      takenOn: latest.dateTaken,
      testId: latest.testId,
      subjects: courses.map((course) => {
        const result = latest.subjects.find((s) => sameSubject(s.name, course));
        return { subject: subjectLabel(course), mark: result ? Math.round(result.scorePercentage) : null };
      }),
      target,
    };
  }

  const practiced = courses.map((course) => {
    const result = aggregate.find((a) => sameSubject(a.subjectName, course));
    return { subject: subjectLabel(course), mark: result ? Math.round(result.percentage) : null };
  });

  return practiced.some((s) => s.mark !== null)
    ? { kind: "practice", subjects: practiced, target }
    : { kind: "none", subjects: practiced, target };
};

/** The target spread evenly over four subjects, rounded to a mark that can be scored. */
export const targetPace = (target: number) => Math.round(target / 4);

// ── Study next ───────────────────────────────────────────────────────────────

export type StudyFocus =
  | { kind: "topic"; topic: string; subject: string }
  | { kind: "unpractised"; subject: string }
  | { kind: "subject"; subject: string; mark: number }
  | { kind: "none" };

export const pickStudyFocus = (
  courses: string[],
  aggregate: SubjectPerformance[],
  confidences: TopicConfidence[],
): StudyFocus => {
  const inCourses = (subject: string) => courses.some((c) => sameSubject(c, subject));

  const weakestTopic = confidences
    .filter((t) => inCourses(t.subjectName))
    .sort((a, b) => a.confidenceLevelValue - b.confidenceLevelValue)[0];
  if (weakestTopic) {
    return { kind: "topic", topic: weakestTopic.topicName, subject: subjectLabel(weakestTopic.subjectName) };
  }

  const unpractised = courses.find((c) => !aggregate.some((a) => sameSubject(a.subjectName, c)));
  if (unpractised && aggregate.length > 0) {
    return { kind: "unpractised", subject: subjectLabel(unpractised) };
  }

  const lowest = aggregate.filter((a) => inCourses(a.subjectName)).sort((a, b) => a.percentage - b.percentage)[0];
  if (lowest) {
    return { kind: "subject", subject: subjectLabel(lowest.subjectName), mark: Math.round(lowest.percentage) };
  }

  return { kind: "none" };
};

// ── Daily challenge month ────────────────────────────────────────────────────

const counted = (d: CalendarDayModel) => d.statusVisual === "completed" || d.statusVisual === "late_completion";

/**
 * Days done out of days the challenge was open to this candidate before today. Days before
 * they joined, days with no challenge, today and the future are not counted against them.
 */
export const monthTotal = (days: CalendarDayModel[]) => ({
  done: days.filter(counted).length,
  available: days.filter((d) => counted(d) || d.statusVisual === "missed").length,
});

/** The calendar API counts from Sunday; the dashboard starts weeks on Monday. */
export const mondayOffset = (sundayOffset: number) => (sundayOffset + 6) % 7;

// ── Recent tests ─────────────────────────────────────────────────────────────

export interface LedgerRow {
  testId: string;
  takenOn: string;
  kind: string;
  subjects: string;
  /** "248 / 400" for a full test, otherwise the percentage with the questions answered. */
  score: string;
  detail: string;
  isFullTest: boolean;
}

const KIND_LABEL: Record<PracticeTestType, string> = {
  [PracticeTestType.Custom]: "Custom practice",
  [PracticeTestType.Standard]: "Full UTME practice",
  [PracticeTestType.Mock]: "Mock",
};

export const buildLedger = (recentTests: RecentTest[], limit = 5): LedgerRow[] =>
  [...recentTests]
    .sort(byNewest)
    .slice(0, limit)
    .map((test) => {
      const full = isFullTest(test);
      return {
        testId: test.testId,
        takenOn: test.dateTaken,
        kind: KIND_LABEL[test.practiceTestType] ?? "Practice",
        subjects: test.subjects.map((s) => subjectLabel(s.name)).join(", "),
        score: full ? `${fullTestTotal(test)} / ${UTME_MAX}` : `${Math.round(test.totalScorePercentage || 0)}%`,
        detail: `${test.numberOfCorrectAnswers} of ${test.numberOfQuestionsAttempted} right`,
        isFullTest: full,
      };
    });
