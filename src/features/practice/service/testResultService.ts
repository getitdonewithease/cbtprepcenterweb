import { subjectLabel } from "@/core/utils/subjectLabel";
import { getCbtSessionDetails, getRecentCbtSessions } from "../api/practiceApi";
import { parseTimeSpan, statusOf, type TestBriefStatus } from "./testBriefService";

/**
 * A test's result as the top of its review shows it: the mark (out of 400 for a full test),
 * each subject's mark, and the last full test's mark to compare with. Marking happens in the
 * background after submitting, so the result is "not yet marked" for a few seconds.
 */

export interface SubjectMark {
  name: string;
  score: number;
  max: number;
}

export interface TestResult {
  status: TestBriefStatus;
  /** Sum of the subjects' marks, and of their maximums (400 for a full test). */
  mark: number;
  max: number;
  subjects: SubjectMark[];
  right: number;
  total: number;
  answered: number;
  secondsUsed: number;
  secondsAllowed: number;
  createdOn: string | null;
}

interface SubjectScoreResponse {
  subject?: string;
  score?: number;
  maxScore?: number;
}

interface SessionResponse {
  id?: string;
  cbtSessionStatus?: number | string;
  subjectScore?: SubjectScoreResponse[] | null;
  numberOfQuestion?: number;
  numberOfQuestionAttempted?: number;
  numberOfCorrectAnswers?: number;
  duration?: string;
  durationUsed?: string;
  createdOn?: string;
}

const isEnglish = (name: string) => name.toLowerCase().includes("english");

export const toTestResult = (s: SessionResponse): TestResult => {
  const subjects = (s.subjectScore ?? [])
    .map((x) => ({ name: subjectLabel(x.subject ?? ""), score: Number(x.score ?? 0), max: Number(x.maxScore ?? 0) }))
    .filter((x) => x.name && x.max > 0)
    .sort((a, b) => Number(isEnglish(b.name)) - Number(isEnglish(a.name)));
  // English is 60 questions at 1.67 marks each, so it can add up to 100.2: shown as 100
  const mark = Math.round(subjects.reduce((n, x) => n + Math.min(x.score, x.max), 0));
  return {
    status: statusOf(s.cbtSessionStatus),
    mark,
    max: Math.round(subjects.reduce((n, x) => n + x.max, 0)),
    subjects,
    right: Number(s.numberOfCorrectAnswers ?? 0),
    total: Number(s.numberOfQuestion ?? 0),
    answered: Number(s.numberOfQuestionAttempted ?? 0),
    secondsUsed: parseTimeSpan(s.durationUsed),
    secondsAllowed: parseTimeSpan(s.duration),
    createdOn: s.createdOn ?? null,
  };
};

/** A full UTME practice: four subjects marked out of 400. */
export const isFullMark = (r: Pick<TestResult, "max" | "subjects">) => r.max === 400 && r.subjects.length === 4;

/** The mark of the most recent full test before this one, or null when this is the first. */
export const previousFullMark = (sessions: SessionResponse[], current: { id: string; createdOn: string | null }): number | null => {
  const before = current.createdOn ? Date.parse(current.createdOn) : Number.POSITIVE_INFINITY;
  const earlier = sessions
    .filter((s) => s.id !== current.id && statusOf(s.cbtSessionStatus) === "submitted" && s.createdOn && Date.parse(s.createdOn) < before)
    .map((s) => ({ at: Date.parse(s.createdOn ?? ""), r: toTestResult(s) }))
    .filter((x) => isFullMark(x.r))
    .sort((a, b) => b.at - a.at);
  return earlier.length ? earlier[0].r.mark : null;
};

export const goalLine = (mark: number, goal: number | null | undefined) => {
  if (!goal) return null;
  const gap = goal - mark;
  if (gap > 0) return `${gap} to go to your goal of ${goal}.`;
  if (gap === 0) return `Right on your goal of ${goal}.`;
  return `${-gap} above your goal of ${goal}.`;
};

/** previous: a mark, null for a first full test, undefined when it couldn't be checked. */
export const changeLine = (mark: number, previous: number | null | undefined) => {
  if (previous === undefined) return null;
  if (previous === null) return "Your first full test: this is the mark to beat.";
  const d = mark - previous;
  if (d > 0) return `${d} more than your last full test (${previous}).`;
  if (d === 0) return `The same as your last full test (${previous}).`;
  return `${-d} less than your last full test (${previous}).`;
};

/** 6420 → "1 hour 47 minutes"; under a minute → "under a minute". */
export const spokenDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const p = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  return [h ? p(h, "hour") : "", m ? p(m, "minute") : ""].filter(Boolean).join(" ") || "under a minute";
};

export const testResultService = {
  async getResult(cbtSessionId: string): Promise<TestResult> {
    return toTestResult((await getCbtSessionDetails(cbtSessionId)) as SessionResponse);
  },
  /** Best effort: undefined when it can't be checked (no comparison beats a wrong one). */
  async getPreviousFullMark(cbtSessionId: string, createdOn: string | null): Promise<number | null | undefined> {
    try {
      return previousFullMark((await getRecentCbtSessions(30)) as SessionResponse[], { id: cbtSessionId, createdOn });
    } catch {
      return undefined;
    }
  },
};
