import type { SubjectBlock, TestScreenAnswers, TestScreenQuestion } from "../types/testScreenTypes";

/** Rules of the shared test screen that don't depend on React (practice and daily challenge). */

const isEnglish = (subject: string) => subject.toLowerCase().includes("english");

/** Each subject's questions together, English first (as on the UTME paper), otherwise in the order sent. */
export const groupBySubject = <T extends { subject: string }>(questions: T[]): T[] => {
  const order: string[] = [];
  for (const q of questions) if (!order.includes(q.subject)) order.push(q.subject);
  order.sort((a, b) => Number(isEnglish(b)) - Number(isEnglish(a)));
  return order.flatMap((s) => questions.filter((q) => q.subject === s));
};

/** The subjects in test order, with where each starts; expects questions grouped by subject. */
export const subjectBlocks = (questions: Array<{ subject: string }>): SubjectBlock[] => {
  const blocks: SubjectBlock[] = [];
  questions.forEach((q, i) => {
    const last = blocks[blocks.length - 1];
    if (last && last.name === q.subject) last.count++;
    else blocks.push({ name: q.subject, start: i, count: 1 });
  });
  return blocks;
};

export const isAnswered = (answers: TestScreenAnswers, id: string) => Boolean(answers[id]);

export const firstBlankIndex = (questions: TestScreenQuestion[], answers: TestScreenAnswers, from = 0): number | null => {
  const i = questions.findIndex((q, k) => k >= from && !isAnswered(answers, q.id));
  return i < 0 ? null : i;
};

export const blankCount = (questions: TestScreenQuestion[], answers: TestScreenAnswers) => questions.filter((q) => !isAnswered(answers, q.id)).length;

/** As the clock shows it: 1:31:05, 4:11, 0:07. */
export const clockText = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};

/** As the API wants it: "01:31:05". */
export const timeSpanText = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/** A passage is read beside the question on a computer; a short instruction sits above it. */
export const isPassage = (section?: string | null) => (section?.length ?? 0) > 280;

/** "null", "undefined" and blanks from the API are no picture. */
export const hasPicture = (url?: string | null) => {
  const v = url?.trim().toLowerCase();
  return Boolean(v && v !== "null" && v !== "undefined");
};

/** "Full UTME practice", "Biology practice", "Use of English and Physics". */
export const practiceTitle = (subjects: string[]) => {
  if (subjects.length === 4) return "Full UTME practice";
  if (subjects.length === 1) return `${subjects[0]} practice`;
  return `${subjects.slice(0, -1).join(", ")} and ${subjects[subjects.length - 1]}`;
};
