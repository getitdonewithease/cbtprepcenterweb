/** The shared test screen (practice tests and the daily challenge). */

export interface TestScreenOption {
  /** What the answer is stored as: the option's letter as the API sends it. */
  id: string;
  /** Shown on the option, A to D. */
  label: string;
  content?: string | null;
  imageUrl?: string | null;
}

export interface TestScreenQuestion {
  id: string;
  /** As people say it: "Use of English", "Mathematics". */
  subject: string;
  content: string;
  /** An instruction, or a passage the question is about. */
  section?: string | null;
  imageUrl?: string | null;
  /** "UTME 2015". */
  tag?: string | null;
  options: TestScreenOption[];
}

/** Questions answered so far: question id to option id. */
export type TestScreenAnswers = Record<string, string>;

export type FinishState = "idle" | "submitting" | "failed";

export interface SubjectBlock {
  name: string;
  /** Index of its first question in the whole test. */
  start: number;
  count: number;
}
