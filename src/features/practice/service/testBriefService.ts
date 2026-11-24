import { subjectLabel } from "@/core/utils/subjectLabel";
import { getCbtSessionConfiguration } from "../api/practiceApi";

/**
 * The page before a test: what the test is (subjects and question counts), how long it
 * runs, how much time is left, and whether it can still be taken. Everything comes from
 * GET /cbtsessions/configuration/{id}; the tips are worked out from the same numbers.
 */

export type TestBriefStatus = "ready" | "inProgress" | "submitted" | "cancelled";

export interface TestBrief {
  subjects: Array<{ name: string; count: number }>;
  total: number;
  durationSec: number;
  remainingSec: number;
  status: TestBriefStatus;
  /** Already started: it carries on with the time left. */
  resumed: boolean;
}

export interface BriefTip {
  lead: string;
  text: string;
}

interface ConfigurationResponse {
  preparedQuestion?: Record<string, number> | null;
  duration?: string | null;
  timeRemaining?: string | null;
  totalQuestionsCount?: number | null;
  status?: number | string | null;
}

export const LOAD_ERROR = "Check your connection and try again. Nothing has started.";
export const EMPTY_ERROR = "It has no questions. Go back and start a new one.";

/** A .NET TimeSpan ("02:00:00", "1.02:00:00", "00:15:00.5") in whole seconds; 0 if unreadable. */
export const parseTimeSpan = (value: string | null | undefined): number => {
  const match = value?.trim().match(/^(?:(\d+)\.)?(\d+):(\d{1,2}):(\d{1,2})(?:\.\d+)?$/);
  if (!match) return 0;
  const [, days, h, m, s] = match;
  return Number(days ?? 0) * 86400 + Number(h) * 3600 + Number(m) * 60 + Number(s);
};

/** CbtSessionStatus, sent as a number (1-4) or its name. */
export const statusOf = (raw: number | string | null | undefined): TestBriefStatus => {
  const key = String(raw ?? "").toLowerCase();
  if (key === "2" || key === "inprogress") return "inProgress";
  if (key === "3" || key === "submitted") return "submitted";
  if (key === "4" || key === "cancelled") return "cancelled";
  return "ready";
};

const isEnglish = (name: string) => name.toLowerCase().includes("english");

export const toTestBrief = (config: ConfigurationResponse): TestBrief => {
  const subjects = Object.entries(config.preparedQuestion ?? {})
    .filter(([, count]) => Number(count) > 0)
    .map(([name, count]) => ({ name: subjectLabel(name), count: Number(count) }))
    // English first, as on the UTME paper
    .sort((a, b) => Number(isEnglish(b.name)) - Number(isEnglish(a.name)));
  const counted = subjects.reduce((sum, s) => sum + s.count, 0);
  const total = counted || Number(config.totalQuestionsCount ?? 0);
  const durationSec = parseTimeSpan(config.duration);
  const left = parseTimeSpan(config.timeRemaining);
  const remainingSec = left > 0 && left <= durationSec ? left : durationSec;
  const status = statusOf(config.status);
  return { subjects, total, durationSec, remainingSec, status, resumed: status === "inProgress" || remainingSec < durationSec };
};

export const isFullTest = (b: TestBrief) => b.subjects.length === 4;

/** "Full UTME practice", "Biology practice", "Use of English and Physics". */
export const titleOf = (b: TestBrief) => {
  if (isFullTest(b)) return "Full UTME practice";
  if (b.subjects.length === 1) return `${b.subjects[0].name} practice`;
  const names = b.subjects.map((s) => s.name);
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** 7200 → "2 hours", 4350 → "1 hour 12 minutes". */
export const spokenTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return [h ? plural(h, "hour") : "", m ? plural(m, "minute") : ""].filter(Boolean).join(" ") || "under a minute";
};

/** As the test's clock shows it: 2:00:00, 1:12:30, 15:00. */
export const clockTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

/** About how long each question gets at the full time: "40 seconds", "2 minutes". */
export const paceOf = (b: TestBrief) => {
  const sec = Math.round(b.durationSec / Math.max(1, b.total));
  return sec < 90 ? `${sec} seconds` : `${Math.round(sec / 60)} minutes`;
};

/** Exam habits for this test, using its own numbers; four at most. */
export const tipsFor = (b: TestBrief): BriefTip[] => {
  const tips: BriefTip[] = [];
  if (b.resumed) {
    tips.push({ lead: "Start with the blanks.", text: "The question numbers show which ones you haven't answered yet." });
  } else if (b.total >= 2 && b.durationSec >= 120) {
    tips.push({
      lead: `Keep to about ${paceOf(b)} a question.`,
      text: `When your clock shows ${clockTime(Math.round(b.durationSec / 2))}, aim to have about ${Math.ceil(b.total / 2)} answered.`,
    });
  }
  tips.push({ lead: "Answer what you know first.", text: "Skip a hard one and come back to it. Easy marks count the same as hard ones." });
  tips.push({ lead: "Never leave one blank.", text: "A wrong answer costs nothing, so a guess can only gain marks." });
  tips.push(
    b.subjects.some((s) => isEnglish(s.name))
      ? { lead: "Read comprehension questions first.", text: "Then read the passage knowing what to look for." }
      : { lead: "Rule out the wrong options.", text: "Choosing between two is easier than choosing between four." },
  );
  return tips.slice(0, 4);
};

export const testBriefService = {
  async getBrief(cbtSessionId: string): Promise<TestBrief> {
    let config: ConfigurationResponse;
    try {
      config = await getCbtSessionConfiguration(cbtSessionId);
    } catch {
      // The API's own message is not for candidates
      throw new Error(LOAD_ERROR);
    }
    const brief = toTestBrief(config ?? {});
    if (brief.total === 0 && brief.status !== "submitted" && brief.status !== "cancelled") throw new Error(EMPTY_ERROR);
    return brief;
  },
};
