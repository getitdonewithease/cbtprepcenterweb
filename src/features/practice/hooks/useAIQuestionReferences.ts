import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReviewQuestion } from "../types/practiceTypes";

interface UseAIQuestionReferencesOptions {
  resetOnQuestionChange?: boolean;
}

interface UseAIQuestionReferencesReturn {
  addReference: (id: string) => void;
  buildPromptPrefix: (questions: ReviewQuestion[]) => string;
  referencedIds: string[];
  removeReference: (id: string) => void;
  replaceReferences: (ids: string[]) => void;
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

export const useAIQuestionReferences = (
  initialQuestion?: ReviewQuestion | null,
  options?: UseAIQuestionReferencesOptions
): UseAIQuestionReferencesReturn => {
  const shouldResetOnQuestionChange = options?.resetOnQuestionChange ?? true;
  const initialQuestionId = initialQuestion?.id ?? null;
  const [referencedIds, setReferencedIds] = useState<string[]>(() => initialQuestionId ? [initialQuestionId] : []);

  useEffect(() => {
    if (!shouldResetOnQuestionChange) {
      return;
    }

    setReferencedIds(initialQuestionId ? [initialQuestionId] : []);
  }, [initialQuestionId, shouldResetOnQuestionChange]);

  const addReference = useCallback((id: string) => {
    setReferencedIds((previous) => previous.includes(id) ? previous : [...previous, id]);
  }, []);

  const removeReference = useCallback((id: string) => {
    setReferencedIds((previous) => previous.filter((referenceId) => referenceId !== id));
  }, []);

  const replaceReferences = useCallback((ids: string[]) => {
    setReferencedIds(Array.from(new Set(ids)));
  }, []);

  const buildPromptPrefix = useCallback((questions: ReviewQuestion[]) => {
    const questionMap = new Map(questions.map((question) => [question.id, question]));
    const referencedQuestions = (referencedIds.length > 0 ? referencedIds : (initialQuestionId ? [initialQuestionId] : []))
      .map((id) => questionMap.get(id))
      .filter((question): question is ReviewQuestion => Boolean(question));

    return referencedQuestions
      .map((question, index) => {
        const cleanText = stripHtml(question.text);
        const optionsBlock = question.options.length > 0
          ? "\nOptions:\n" + question.options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`).join("\n")
          : "";

        const hasUserAnswer = typeof question.userAnswer === "number" && question.userAnswer >= 0;
        const hasCorrectAnswer = typeof question.correctAnswer === "number" && question.correctAnswer >= 0;
        const chosenLetter = hasUserAnswer ? String.fromCharCode(65 + question.userAnswer) : null;
        const correctLetter = hasCorrectAnswer ? String.fromCharCode(65 + question.correctAnswer) : null;
        const chosenText = hasUserAnswer ? question.options[question.userAnswer] ?? null : null;
        const correctText = hasCorrectAnswer ? question.options[question.correctAnswer] ?? null : null;
        const chosenLine = chosenLetter && chosenText ? `\nStudent's chosen option: ${chosenLetter}. ${chosenText}` : "";
        const correctLine = correctLetter && correctText ? `\nCorrect option: ${correctLetter}. ${correctText}` : "";

        return `Question Reference ${index + 1} (ID: ${question.id}):\nQuestion: ${cleanText}${optionsBlock}${chosenLine}${correctLine}`;
      })
      .join("\n\n");
  }, [initialQuestionId, referencedIds]);

  return useMemo(() => ({
    addReference,
    buildPromptPrefix,
    referencedIds,
    removeReference,
    replaceReferences,
  }), [addReference, buildPromptPrefix, referencedIds, removeReference, replaceReferences]);
};