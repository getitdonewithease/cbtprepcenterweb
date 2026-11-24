import { saveTestProgressOnExit } from "../api/practiceApi";
import type { Question } from "../types/practiceTypes";

const toQuestionAnswers = (answers: Record<string, number>, questions: Question[]) =>
  Object.entries(answers).map(([questionId, optionIndex]) => {
    const question = questions.find((item) => item.id === questionId);
    return {
      questionId,
      chosenOption: question?.optionAlphas?.[optionIndex] || String.fromCharCode(65 + optionIndex),
    };
  });

export const practiceProgressService = {
  async saveOnExit(
    sessionId: string,
    answers: Record<string, number>,
    questions: Question[],
    remainingTime: string
  ): Promise<void> {
    try {
      await saveTestProgressOnExit(sessionId, toQuestionAnswers(answers, questions), remainingTime);
    } catch (error: unknown) {
      // Best effort: the page is going away, so there is nobody to show an error to.
      console.error("Failed to save progress on exit:", error);
    }
  },
};
