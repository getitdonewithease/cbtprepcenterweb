import { describe, expect, it } from "vitest";
import { clockTime, parseTimeSpan, spokenTime, statusOf, tipsFor, titleOf, toTestBrief } from "../testBriefService";

const FULL = { English: 60, Mathematics: 40, Physics: 40, Chemistry: 40 };

describe("testBriefService", () => {
  it("reads .NET time spans", () => {
    expect(parseTimeSpan("02:00:00")).toBe(7200);
    expect(parseTimeSpan("00:15:00.5000000")).toBe(900);
    expect(parseTimeSpan("1.02:00:00")).toBe(93600);
    expect(parseTimeSpan("soon")).toBe(0);
    expect(parseTimeSpan(undefined)).toBe(0);
  });

  it("reads the status as a number or a name", () => {
    expect(statusOf(1)).toBe("ready");
    expect(statusOf(2)).toBe("inProgress");
    expect(statusOf("Submitted")).toBe("submitted");
    expect(statusOf(4)).toBe("cancelled");
    expect(statusOf(null)).toBe("ready");
  });

  it("builds a fresh full test, English first", () => {
    const brief = toTestBrief({ preparedQuestion: { Physics: 40, ...FULL }, duration: "02:00:00", timeRemaining: "02:00:00", status: 1 });
    expect(brief.subjects[0].name).toBe("Use of English");
    expect(brief.total).toBe(180);
    expect(brief.resumed).toBe(false);
    expect(titleOf(brief)).toBe("Full UTME practice");
  });

  it("carries on with the time left", () => {
    const brief = toTestBrief({ preparedQuestion: FULL, duration: "02:00:00", timeRemaining: "01:12:30", status: 2 });
    expect(brief.resumed).toBe(true);
    expect(brief.remainingSec).toBe(4350);
    expect(clockTime(brief.remainingSec)).toBe("1:12:30");
    expect(spokenTime(brief.remainingSec)).toBe("1 hour 12 minutes");
  });

  it("never shows more time left than the test has", () => {
    const brief = toTestBrief({ preparedQuestion: { Biology: 20 }, duration: "00:15:00", timeRemaining: "00:00:00", status: 1 });
    expect(brief.remainingSec).toBe(900);
    expect(clockTime(900)).toBe("15:00");
  });

  it("names tests by their subjects", () => {
    expect(titleOf(toTestBrief({ preparedQuestion: { biology: 20 }, duration: "00:15:00" }))).toBe("Biology practice");
    expect(titleOf(toTestBrief({ preparedQuestion: { english: 20, physics: 20 }, duration: "00:30:00" }))).toBe("Use of English and Physics");
  });

  it("gives tips from the test's own numbers", () => {
    const tips = tipsFor(toTestBrief({ preparedQuestion: FULL, duration: "02:00:00", timeRemaining: "02:00:00", status: 1 }));
    expect(tips).toHaveLength(4);
    expect(tips[0].lead).toBe("Keep to about 40 seconds a question.");
    expect(tips[0].text).toContain("1:00:00");
    expect(tips[0].text).toContain("90 answered");
    expect(tips[3].lead).toContain("comprehension");
    const resumed = tipsFor(toTestBrief({ preparedQuestion: { Biology: 20 }, duration: "00:15:00", timeRemaining: "00:05:00", status: 2 }));
    expect(resumed[0].lead).toBe("Start with the blanks.");
    expect(resumed[3].lead).toBe("Rule out the wrong options.");
  });
});
