/**
 * A question the AI tutor is asked about. Its details travel ahead of each message the
 * candidate sends, so the tutor knows the question, their answer and the right one; the
 * candidate only ever sees their own words. The opening "Question Reference" line is the
 * format the review chat has always sent, so older chats strip the same way.
 */

export interface TutorQuestion {
  id: string;
  text: string;
  options: string[];
  /** Letters as the test showed them (A, B, C, D). */
  optionLetters?: string[];
  userAnswerIndex?: number;
  correctAnswerIndex?: number;
}

const MESSAGE_MARKER = "\n\nStudent's message:\n";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

const letterAt = (question: TutorQuestion, index: number) => question.optionLetters?.[index] ?? String.fromCharCode(65 + index);

export const buildQuestionContext = (question: TutorQuestion): string => {
  const options = question.options.map((option, index) => `${letterAt(question, index)}. ${stripHtml(option)}`).join("\n");
  const chosen =
    question.userAnswerIndex !== undefined && question.userAnswerIndex >= 0
      ? `\nStudent's chosen option: ${letterAt(question, question.userAnswerIndex)}. ${stripHtml(question.options[question.userAnswerIndex] ?? "")}`
      : "\nStudent's chosen option: none (skipped)";
  const correct =
    question.correctAnswerIndex !== undefined && question.correctAnswerIndex >= 0
      ? `\nCorrect option: ${letterAt(question, question.correctAnswerIndex)}. ${stripHtml(question.options[question.correctAnswerIndex] ?? "")}`
      : "";
  return `Question Reference 1 (ID: ${question.id}):\nQuestion: ${stripHtml(question.text)}\nOptions:\n${options}${chosen}${correct}`;
};

/** The prompt the tutor receives: the question's details, then what the candidate wrote. */
export const withQuestionContext = (context: string, message: string) => `${context}${MESSAGE_MARKER}${message}`;

/** What the candidate wrote, without the question details sent ahead of it. */
export const stripQuestionContext = (text: string): string => {
  if (!text.trim().toLowerCase().startsWith("question reference")) return text;
  const marker = text.indexOf(MESSAGE_MARKER);
  if (marker !== -1) return text.slice(marker + MESSAGE_MARKER.length).trim();
  // Older review chats: the details, a blank line, then the message
  const lastBreak = text.lastIndexOf("\n\n");
  return lastBreak === -1 ? text : text.slice(lastBreak + 2).trim();
};
