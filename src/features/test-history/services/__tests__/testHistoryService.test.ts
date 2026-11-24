import { describe, expect, it } from "vitest";
import { TestType, type TestRecord } from "../../types/testHistoryTypes";
import { filterTests, outOf400, percentRight, resultOf, subjectsInHistory, subjectsOf, unfinishedOf } from "../testHistoryService";

const test = (overrides: Partial<TestRecord>): TestRecord => ({
  id: "t",
  createdOn: "2026-11-20T10:00:00Z",
  type: TestType.Custom,
  status: "submitted",
  subjects: [{ name: "Physics", percentage: 45, numberOfQuestions: 20 }],
  numberOfQuestions: 20,
  numberOfAttempted: 20,
  numberOfCorrect: 9,
  secondsUsed: 1140,
  ...overrides,
});

const full = test({
  id: "full",
  type: TestType.Standard,
  subjects: [
    { name: "Use of English", percentage: 68.3, numberOfQuestions: 60 },
    { name: "Mathematics", percentage: 65, numberOfQuestions: 40 },
    { name: "Physics", percentage: 47.5, numberOfQuestions: 40 },
    { name: "Biology", percentage: 70, numberOfQuestions: 40 },
  ],
});

describe("test history rules", () => {
  it("says a full test out of 400 (the sum of its subject percentages) and practice as % right", () => {
    expect(outOf400(full)).toBe(251);
    expect(resultOf(full)).toBe("251 / 400");
    expect(percentRight(test({}))).toBe(45);
    expect(resultOf(test({}))).toBe("45%");
    expect(resultOf(test({ type: TestType.Mock, subjects: full.subjects }))).toBe("251 / 400");
  });

  it("names four subjects as all four, otherwise lists them", () => {
    expect(subjectsOf(full)).toBe("All four subjects");
    expect(subjectsOf(test({}))).toBe("Physics");
  });

  it("puts the test under way before one not started", () => {
    const tests = [
      test({ id: "ns", status: "not-started", createdOn: "2026-11-23T10:00:00Z" }),
      test({ id: "ip", status: "in-progress", createdOn: "2026-11-22T10:00:00Z" }),
      test({ id: "done" }),
    ];
    expect(unfinishedOf(tests).map((t) => t.id)).toEqual(["ip", "ns"]);
  });

  it("filters finished and cancelled tests by kind and subject, newest first, leaving unfinished ones out", () => {
    const tests = [
      full,
      test({ id: "old", createdOn: "2026-11-01T10:00:00Z" }),
      test({ id: "bio", subjects: [{ name: "Biology", percentage: 50, numberOfQuestions: 20 }], createdOn: "2026-11-21T10:00:00Z" }),
      test({ id: "cancelled", status: "cancelled", createdOn: "2026-11-22T10:00:00Z" }),
      test({ id: "open", status: "in-progress" }),
    ];
    expect(filterTests(tests, "all", "all").map((t) => t.id)).toEqual(["cancelled", "bio", "full", "old"]);
    expect(filterTests(tests, "full", "all").map((t) => t.id)).toEqual(["full"]);
    expect(filterTests(tests, "practice", "Biology").map((t) => t.id)).toEqual(["bio"]);
    expect(subjectsInHistory(tests)).toEqual(["Biology", "Mathematics", "Physics", "Use of English"]);
  });
});
