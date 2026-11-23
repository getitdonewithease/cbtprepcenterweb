import { describe, expect, it } from "vitest";
import { buildCalendarDays } from "../dailyChallengeService";
import { CompletionStatus, type DailyChallengeStreakValue } from "../../types/dailyChallengeTypes";

type Streak = Parameters<typeof buildCalendarDays>[2];

const deviceToday = new Date(2026, 10, 22);

const statusOn = (day: number, streak: Partial<DailyChallengeStreakValue>) => {
  const input: Streak = {
    history: [],
    joinedOn: "2026-11-15",
    today: "2026-11-22",
    challengeDates: ["2026-11-10", "2026-11-15", "2026-11-16", "2026-11-22", "2026-11-25"],
    ...streak,
  };

  return buildCalendarDays(2026, 10, input, deviceToday).days[day - 1];
};

describe("buildCalendarDays", () => {
  it("does not mark days before joining as missed", () => {
    expect(statusOn(10, {}).statusVisual).toBe("unattempted");
    expect(statusOn(10, {}).isClickable).toBe(true);
  });

  it("marks skipped challenges from the join date onwards as missed", () => {
    expect(statusOn(15, {}).statusVisual).toBe("missed");
    expect(statusOn(16, {}).statusVisual).toBe("missed");
  });

  it("does not mark a day without a challenge as missed, or let it be opened", () => {
    expect(statusOn(18, {}).statusVisual).toBe("unavailable");
    expect(statusOn(18, {}).isClickable).toBe(false);
  });

  it("never infers missed when the API omits the join date or challenge dates", () => {
    expect(statusOn(16, { joinedOn: undefined }).statusVisual).toBe("unattempted");
    expect(statusOn(16, { challengeDates: undefined }).statusVisual).toBe("unattempted");
  });

  it("does not mark an unfinished challenge from before joining as missed", () => {
    const history = [{ date: "2026-11-10", status: CompletionStatus.Missed, dailyChallengeId: "a" }];

    expect(statusOn(10, { history }).statusVisual).toBe("unattempted");
  });

  it("keeps completed days completed", () => {
    const history = [
      { date: "2026-11-10", status: CompletionStatus.LateCompletion, dailyChallengeId: "a" },
      { date: "2026-11-16", status: CompletionStatus.Completed, dailyChallengeId: "b" },
    ];

    expect(statusOn(10, { history }).statusVisual).toBe("late_completion");
    expect(statusOn(16, { history }).statusVisual).toBe("completed");
  });

  it("uses the server's date for today and future days", () => {
    expect(statusOn(22, {}).statusVisual).toBe("today_pending");
    expect(statusOn(22, { today: "2026-11-21" }).statusVisual).toBe("future");
  });
});
