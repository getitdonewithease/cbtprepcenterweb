import { describe, expect, it } from "vitest";
import type { CalendarDayModel } from "@/features/daily-challenge";
import { PracticeTestType, type RecentTest } from "../../types/dashboardTypes";
import {
  buildLedger,
  buildScoreSummary,
  mondayOffset,
  monthTotal,
  pickStudyFocus,
  subjectLabel,
  targetPace,
} from "../dashboardSummaryService";

const COURSES = ["english", "mathematics", "biology", "physics"];

const test = (overrides: Partial<RecentTest>): RecentTest => ({
  testId: "t1",
  dateTaken: "2026-11-20T10:00:00Z",
  practiceTestType: PracticeTestType.Custom,
  subjects: [],
  totalScorePercentage: 0,
  numberOfCorrectAnswers: 0,
  numberOfQuestionsAttempted: 0,
  averageSpeed: "00:00:02",
  maxScore: 0,
  ...overrides,
});

const fullTest = (id: string, date: string, marks: number[]) =>
  test({
    testId: id,
    dateTaken: date,
    practiceTestType: PracticeTestType.Standard,
    subjects: COURSES.map((name, i) => ({ name, score: marks[i], scorePercentage: marks[i] })),
  });

const day = (dayNumber: number, statusVisual: CalendarDayModel["statusVisual"]): CalendarDayModel => ({
  dayNumber,
  dateString: `2026-11-${String(dayNumber).padStart(2, "0")}`,
  statusVisual,
  dailyChallengeId: null,
  isToday: statusVisual === "today_pending",
  isFuture: statusVisual === "future",
  isClickable: false,
});

describe("buildScoreSummary", () => {
  it("adds the four subject marks of the latest full test into a score out of 400", () => {
    const summary = buildScoreSummary(
      COURSES,
      [fullTest("old", "2026-11-18T10:00:00Z", [60, 55, 50, 59]), fullTest("new", "2026-11-22T10:00:00Z", [68, 61, 64, 55])],
      [],
      250,
    );
    expect(summary.kind).toBe("full-test");
    if (summary.kind !== "full-test") return;
    expect(summary.total).toBe(248);
    expect(summary.change).toBe(24);
    expect(summary.testId).toBe("new");
    expect(summary.subjects.map((s) => s.subject)).toEqual(["Use of English", "Mathematics", "Biology", "Physics"]);
  });

  it("never invents a total from practice: no full test gives per-subject averages only", () => {
    const summary = buildScoreSummary(
      COURSES,
      [test({ subjects: [{ name: "mathematics", score: 4, scorePercentage: 40 }] })],
      [{ subjectName: "mathematics", percentage: 40 }, { subjectName: "biology", percentage: 0 }],
      undefined,
    );
    expect(summary.kind).toBe("practice");
    expect("total" in summary).toBe(false);
    expect(summary.target).toBe(250);
    expect(summary.subjects.find((s) => s.subject === "Physics")?.mark).toBeNull();
    expect(summary.subjects.find((s) => s.subject === "Biology")?.mark).toBe(0);
  });

  it("reports nothing taken yet as its own state", () => {
    expect(buildScoreSummary(COURSES, [], [], 300).kind).toBe("none");
  });
});

describe("targetPace", () => {
  it("rounds the per-subject share to a mark that can be scored", () => {
    expect(targetPace(250)).toBe(63);
  });
});

describe("pickStudyFocus", () => {
  it("names the weakest topic in the candidate's own subjects first", () => {
    const focus = pickStudyFocus(COURSES, [{ subjectName: "chemistry", percentage: 10 }], [
      { topicName: "Titration", subjectName: "chemistry", confidenceLevelValue: 0.1, confidenceLevel: "Low" },
      { topicName: "Projectiles", subjectName: "physics", confidenceLevelValue: 0.3, confidenceLevel: "Low" },
    ]);
    expect(focus).toEqual({ kind: "topic", topic: "Projectiles", subject: "Physics" });
  });

  it("points to a subject never practised before the weakest practised one", () => {
    const focus = pickStudyFocus(COURSES, [
      { subjectName: "english", percentage: 0 },
      { subjectName: "mathematics", percentage: 40 },
      { subjectName: "biology", percentage: 0 },
    ], []);
    expect(focus).toEqual({ kind: "unpractised", subject: "Physics" });
  });

  it("falls back to the lowest subject, then to nothing", () => {
    expect(pickStudyFocus(["mathematics"], [{ subjectName: "mathematics", percentage: 40 }], [])).toEqual({
      kind: "subject",
      subject: "Mathematics",
      mark: 40,
    });
    expect(pickStudyFocus(COURSES, [], [])).toEqual({ kind: "none" });
  });
});

describe("monthTotal", () => {
  it("counts done and late days against days that were open, not days before joining", () => {
    const days = [
      day(1, "unattempted"),
      day(2, "completed"),
      day(3, "late_completion"),
      day(4, "missed"),
      day(5, "unavailable"),
      day(6, "today_pending"),
      day(7, "future"),
    ];
    expect(monthTotal(days)).toEqual({ done: 2, available: 3 });
  });
});

describe("mondayOffset", () => {
  it("moves a Sunday-first offset to Monday-first", () => {
    expect(mondayOffset(0)).toBe(6); // month starts on a Sunday
    expect(mondayOffset(1)).toBe(0); // month starts on a Monday
  });
});

describe("buildLedger and subjectLabel", () => {
  it("shows full tests out of 400 and practice as a percentage, newest first", () => {
    const rows = buildLedger([
      test({ testId: "c", dateTaken: "2026-11-21T10:00:00Z", totalScorePercentage: 20, numberOfCorrectAnswers: 4, numberOfQuestionsAttempted: 20 }),
      fullTest("f", "2026-11-22T10:00:00Z", [68, 61, 64, 55]),
    ]);
    expect(rows.map((r) => [r.testId, r.score])).toEqual([["f", "248 / 400"], ["c", "20%"]]);
    expect(rows[1].detail).toBe("4 of 20 right");
    expect(subjectLabel("english")).toBe("Use of English");
  });
});
