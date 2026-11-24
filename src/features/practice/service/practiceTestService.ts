import { subjectLabel } from "@/core/utils/subjectLabel";
import { getCbtSessionConfiguration, getTestQuestions, saveTestProgress, saveTestProgressOnExit, submitTestResults } from "../api/practiceApi";
import type { PracticeQuestionOptionResponse, PracticeQuestionResponse } from "../types/practiceTypes";
import type { TestScreenAnswers, TestScreenQuestion } from "../types/testScreenTypes";
import { parseTimeSpan, statusOf, type TestBriefStatus } from "./testBriefService";
import { groupBySubject, timeSpanText } from "./testScreenService";

/**
 * A practice test while it's being taken: load the questions with any answers already saved
 * and the time left (from the server, never a made-up two hours), save progress, and send
 * the answers. Errors carry copy a candidate can read.
 */

export const LOAD_FAILED = "Check your connection and try again. Your answers so far are saved.";
export const SEND_FAILED = "Check your connection and try again. Your answers are still here.";

export interface PracticeTestData {
  questions: TestScreenQuestion[];
  answers: TestScreenAnswers;
  secondsLeft: number;
  /** The test's full time. */
  totalSeconds: number;
  status: TestBriefStatus;
}

const alphaOf = (o: PracticeQuestionOptionResponse) => o.optionAlpha ?? o.label ?? "";
const contentOf = (o: PracticeQuestionOptionResponse) => o.optionContent ?? o.content ?? "";

export const toScreenQuestion = (q: PracticeQuestionResponse): TestScreenQuestion => ({
  id: q.questionId,
  subject: subjectLabel(q.subjectName || "Questions"),
  content: q.questionContent,
  section: q.section && q.section !== "null" ? q.section : null,
  imageUrl: q.imageUrl ?? null,
  tag: [q.examType?.toUpperCase(), q.examYear].filter(Boolean).join(" ") || null,
  options: q.optionCommandResponses.map((o, i) => {
    const alpha = alphaOf(o) || String.fromCharCode(65 + i);
    return { id: alpha, label: alpha, content: contentOf(o), imageUrl: o.imageUrl ?? null };
  }),
});

/** Answers saved on the server, as the screen holds them (question id to option letter). */
export const savedAnswersOf = (raw: PracticeQuestionResponse[], questions: TestScreenQuestion[]): TestScreenAnswers => {
  const answers: TestScreenAnswers = {};
  for (const r of raw) {
    const q = questions.find((x) => x.id === r.questionId);
    if (r.chosenOption && q?.options.some((o) => o.id === r.chosenOption)) answers[r.questionId] = r.chosenOption;
  }
  return answers;
};

/** Every question, answered or not ("X" for a blank, as the API expects). */
export const answersPayload = (questions: TestScreenQuestion[], answers: TestScreenAnswers) =>
  questions.map((q) => ({ questionId: q.id, chosenOption: answers[q.id] || "X" }));

export const practiceTestService = {
  async load(cbtSessionId: string): Promise<PracticeTestData> {
    try {
      const [raw, config] = await Promise.all([getTestQuestions(cbtSessionId), getCbtSessionConfiguration(cbtSessionId)]);
      const questions = groupBySubject(raw.map(toScreenQuestion));
      const total = parseTimeSpan(config?.duration);
      const left = parseTimeSpan(config?.timeRemaining);
      return {
        questions,
        answers: savedAnswersOf(raw, questions),
        // A zero "left" on a test not yet started means the full time
        secondsLeft: left > 0 ? Math.min(left, total || left) : total,
        totalSeconds: total,
        status: statusOf(config?.status),
      };
    } catch {
      throw new Error(LOAD_FAILED);
    }
  },

  /** Saves progress; true when the server took it. */
  async save(cbtSessionId: string, questions: TestScreenQuestion[], answers: TestScreenAnswers, secondsLeft: number): Promise<boolean> {
    const res = await saveTestProgress(
      {
        sessionId: cbtSessionId,
        currentQuestionIndex: 0,
        answers: {},
        questionAnswers: answersPayload(questions, answers).filter((a) => a.chosenOption !== "X"),
        timeRemaining: secondsLeft * 1000,
        remainingTime: timeSpanText(secondsLeft),
        lastSaved: Date.now(),
        tabSwitchCount: 0,
        tabSwitchHistory: [],
        isProgressSave: true,
      },
      { isPeriodic: true },
    );
    return Boolean(res?.isSuccess);
  },

  /** While the page closes or hides: a request the browser finishes on its own. */
  saveOnExit(cbtSessionId: string, questions: TestScreenQuestion[], answers: TestScreenAnswers, secondsLeft: number) {
    void saveTestProgressOnExit(
      cbtSessionId,
      answersPayload(questions, answers).filter((a) => a.chosenOption !== "X"),
      timeSpanText(secondsLeft),
    ).catch(() => undefined);
  },

  async submit(cbtSessionId: string, questions: TestScreenQuestion[], answers: TestScreenAnswers, secondsLeft: number): Promise<void> {
    let res: { isSuccess?: boolean } | undefined;
    try {
      res = await submitTestResults(cbtSessionId, answersPayload(questions, answers), timeSpanText(secondsLeft));
    } catch {
      throw new Error(SEND_FAILED);
    }
    if (!res?.isSuccess) throw new Error(SEND_FAILED);
  },
};
