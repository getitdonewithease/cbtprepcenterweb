import { describe, expect, it } from "vitest";
import { blankCount, clockText, firstBlankIndex, groupBySubject, hasPicture, isPassage, practiceTitle, subjectBlocks, timeSpanText } from "../testScreenService";
import { answersPayload, savedAnswersOf, toScreenQuestion } from "../practiceTestService";
import type { PracticeQuestionResponse } from "../../types/practiceTypes";
import type { TestScreenQuestion } from "../../types/testScreenTypes";

const q = (id: string, subject: string): TestScreenQuestion => ({ id, subject, content: id, options: [{ id: "A", label: "A" }, { id: "B", label: "B" }] });

describe("testScreenService", () => {
  it("keeps each subject together, English first", () => {
    const grouped = groupBySubject([q("m1", "Mathematics"), q("e1", "Use of English"), q("m2", "Mathematics"), q("p1", "Physics"), q("e2", "Use of English")]);
    expect(grouped.map((x) => x.id)).toEqual(["e1", "e2", "m1", "m2", "p1"]);
    expect(subjectBlocks(grouped)).toEqual([
      { name: "Use of English", start: 0, count: 2 },
      { name: "Mathematics", start: 2, count: 2 },
      { name: "Physics", start: 4, count: 1 },
    ]);
  });

  it("finds the first blank and counts blanks", () => {
    const qs = [q("a", "X"), q("b", "X"), q("c", "X")];
    expect(firstBlankIndex(qs, { a: "A" })).toBe(1);
    expect(firstBlankIndex(qs, { a: "A", b: "B", c: "A" })).toBeNull();
    expect(blankCount(qs, { b: "B" })).toBe(2);
  });

  it("shows the clock as the page before the test does, and sends it as a TimeSpan", () => {
    expect(clockText(5465)).toBe("1:31:05");
    expect(clockText(251)).toBe("4:11");
    expect(clockText(-3)).toBe("0:00");
    expect(timeSpanText(5465)).toBe("01:31:05");
    expect(timeSpanText(0)).toBe("00:00:00");
  });

  it("tells passages and pictures apart from noise", () => {
    expect(isPassage("In questions 57 and 58, identify the word.")).toBe(false);
    expect(isPassage("x".repeat(400))).toBe(true);
    expect(hasPicture("null")).toBe(false);
    expect(hasPicture(" ")).toBe(false);
    expect(hasPicture("https://example.com/a.png")).toBe(true);
  });

  it("names the test by its subjects", () => {
    expect(practiceTitle(["Use of English", "Mathematics", "Physics", "Chemistry"])).toBe("Full UTME practice");
    expect(practiceTitle(["Biology"])).toBe("Biology practice");
    expect(practiceTitle(["Use of English", "Physics"])).toBe("Use of English and Physics");
  });
});

describe("practiceTestService", () => {
  const raw: PracticeQuestionResponse[] = [
    {
      questionId: "q1",
      subjectName: "mathematics",
      questionContent: "1 + 1",
      examType: "utme",
      examYear: "2015",
      section: "null",
      chosenOption: "B",
      optionCommandResponses: [
        { optionAlpha: "A", optionContent: "1", imageUrl: null },
        { optionAlpha: "B", optionContent: "2", imageUrl: null },
      ],
    },
    {
      questionId: "q2",
      subjectName: "english",
      questionContent: "Pick one",
      chosenOption: "Z",
      optionCommandResponses: [
        { label: "A", content: "yes", imageUrl: null },
        { label: "B", content: "no", imageUrl: null },
      ],
    },
  ];

  it("maps API questions, keeping letters and cleaning blanks", () => {
    const m = toScreenQuestion(raw[0]);
    expect(m.subject).toBe("Mathematics");
    expect(m.tag).toBe("UTME 2015");
    expect(m.section).toBeNull();
    expect(m.options.map((o) => o.label)).toEqual(["A", "B"]);
    expect(toScreenQuestion(raw[1]).options[1]).toMatchObject({ id: "B", content: "no" });
  });

  it("restores only saved answers that match an option", () => {
    const qs = raw.map(toScreenQuestion);
    expect(savedAnswersOf(raw, qs)).toEqual({ q1: "B" });
  });

  it("sends every question, X for a blank", () => {
    const qs = raw.map(toScreenQuestion);
    expect(answersPayload(qs, { q1: "B" })).toEqual([
      { questionId: "q1", chosenOption: "B" },
      { questionId: "q2", chosenOption: "X" },
    ]);
  });
});
