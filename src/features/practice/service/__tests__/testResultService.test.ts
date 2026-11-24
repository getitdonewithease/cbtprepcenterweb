import { describe, expect, it } from "vitest";
import { changeLine, goalLine, isFullMark, previousFullMark, spokenDuration, toTestResult } from "../testResultService";

const full = (id: string, createdOn: string, scores: number[], status = 3) => ({
  id,
  createdOn,
  cbtSessionStatus: status,
  subjectScore: ["chemistry", "english", "mathematics", "physics"].map((subject, i) => ({ subject, score: scores[i], maxScore: 100 })),
  numberOfQuestion: 180,
  numberOfQuestionAttempted: 171,
  numberOfCorrectAnswers: 104,
  duration: "02:00:00",
  durationUsed: "01:47:00",
});

describe("testResultService", () => {
  it("adds up the subjects to the mark out of 400, English first", () => {
    const r = toTestResult(full("a", "2026-11-24T10:00:00Z", [48, 61, 48, 55]));
    expect(r.mark).toBe(212);
    expect(r.max).toBe(400);
    expect(isFullMark(r)).toBe(true);
    expect(r.subjects[0].name).toBe("Use of English");
    expect(r.secondsUsed).toBe(6420);
    expect(r.status).toBe("submitted");
  });

  it("caps English's 100.2 at 100", () => {
    expect(toTestResult(full("a", "2026-11-24T10:00:00Z", [100, 100.2, 100, 100])).mark).toBe(400);
  });

  it("is not a full mark for a shorter test", () => {
    const r = toTestResult({ cbtSessionStatus: 3, subjectScore: [{ subject: "biology", score: 14, maxScore: 20 }], numberOfQuestion: 20, numberOfCorrectAnswers: 14 });
    expect(isFullMark(r)).toBe(false);
    expect(r.max).toBe(20);
  });

  it("compares only with an earlier, finished full test", () => {
    const sessions = [
      full("now", "2026-11-24T10:00:00Z", [48, 61, 48, 55]),
      full("later", "2026-11-25T10:00:00Z", [90, 90, 90, 90]),
      full("unfinished", "2026-11-23T10:00:00Z", [10, 10, 10, 10], 2),
      { id: "short", createdOn: "2026-11-23T09:00:00Z", cbtSessionStatus: 3, subjectScore: [{ subject: "biology", score: 20, maxScore: 20 }] },
      full("last", "2026-11-22T10:00:00Z", [40, 55, 50, 48]),
      full("older", "2026-11-20T10:00:00Z", [30, 40, 40, 40]),
    ];
    expect(previousFullMark(sessions, { id: "now", createdOn: "2026-11-24T10:00:00Z" })).toBe(193);
    expect(previousFullMark([sessions[0]], { id: "now", createdOn: "2026-11-24T10:00:00Z" })).toBeNull();
  });

  it("says the goal and the change plainly", () => {
    expect(goalLine(212, 250)).toBe("38 to go to your goal of 250.");
    expect(goalLine(268, 250)).toBe("18 above your goal of 250.");
    expect(goalLine(250, 250)).toBe("Right on your goal of 250.");
    expect(goalLine(212, null)).toBeNull();
    expect(changeLine(212, 193)).toBe("19 more than your last full test (193).");
    expect(changeLine(180, 193)).toBe("13 less than your last full test (193).");
    expect(changeLine(212, null)).toBe("Your first full test: this is the mark to beat.");
    expect(changeLine(212, undefined)).toBeNull();
    expect(spokenDuration(6420)).toBe("1 hour 47 minutes");
    expect(spokenDuration(37)).toBe("under a minute");
  });
});
