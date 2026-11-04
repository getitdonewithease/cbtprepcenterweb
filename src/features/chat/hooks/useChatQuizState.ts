import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChatQuizOptionKey,
  ChatQuizQuestion,
  ChatQuizSelectedAnswers,
  ChatQuizSubmission,
} from "../types/chatQuizTypes";
import { formatQuizSubmissionPrompt } from "../utils/chatQuizParser";

interface CachedQuizSessionState {
  sessionKey: string;
  selectedAnswers: ChatQuizSelectedAnswers;
  isSubmitted: boolean;
  currentStep: number;
  isCollapsed?: boolean;
}

const quizStateCache = new Map<string, CachedQuizSessionState>();
let lastActiveSessionKey: string | null = null;

const handleSessionKeyTransition = (nextSessionKey: string) => {
  if (lastActiveSessionKey !== null && lastActiveSessionKey !== nextSessionKey) {
    // When navigating to another chat history session, reset cached collapse state
    // so cards in previous sessions start collapsed when revisited.
    for (const [key, entry] of quizStateCache.entries()) {
      if (entry.sessionKey === lastActiveSessionKey) {
        quizStateCache.set(key, {
          ...entry,
          isCollapsed: true,
        });
      }
    }
  }
  lastActiveSessionKey = nextSessionKey;
};

const buildQuizCacheKey = (
  quizKey: string | undefined,
  questions: ChatQuizQuestion[],
): string | null => {
  const firstQuestion = questions[0];
  if (!firstQuestion) {
    return null;
  }
  const signature =
    firstQuestion.question.trim() ||
    firstQuestion.options.map((opt) => opt.text).join("|");
  if (!signature) {
    return null;
  }
  return `${quizKey ?? "default"}::${signature.slice(0, 120)}`;
};

export interface UseChatQuizStateOptions {
  questions: ChatQuizQuestion[];
  quizKey?: string;
  defaultCollapsed?: boolean;
  initialSubmittedAnswers?: ChatQuizSelectedAnswers | null;
  onSubmitQuiz?: (submission: ChatQuizSubmission) => void;
}

export interface UseChatQuizStateResult {
  currentStep: number;
  currentQuestion: ChatQuizQuestion | null;
  selectedAnswers: ChatQuizSelectedAnswers;
  isSubmitted: boolean;
  isCollapsed: boolean;
  answeredCount: number;
  allQuestionsAnswered: boolean;
  hasAnswerKeys: boolean;
  score: number;
  totalQuestions: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  selectOption: (questionIndex: number, optionKey: ChatQuizOptionKey) => void;
  goToStep: (stepIndex: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  toggleCollapsed: () => void;
  submitQuiz: () => void;
}

export const useChatQuizState = ({
  questions,
  quizKey,
  defaultCollapsed = false,
  initialSubmittedAnswers,
  onSubmitQuiz,
}: UseChatQuizStateOptions): UseChatQuizStateResult => {
  const resolvedSessionKey = quizKey ?? "default";
  handleSessionKeyTransition(resolvedSessionKey);

  const cacheKey = useMemo(
    () => buildQuizCacheKey(quizKey, questions),
    [quizKey, questions],
  );

  const cachedState = cacheKey ? quizStateCache.get(cacheKey) : undefined;

  const [currentStep, setCurrentStep] = useState<number>(
    () => cachedState?.currentStep ?? 0,
  );
  const [selectedAnswers, setSelectedAnswers] = useState<ChatQuizSelectedAnswers>(
    () => initialSubmittedAnswers ?? cachedState?.selectedAnswers ?? {},
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    () => Boolean(initialSubmittedAnswers) || Boolean(cachedState?.isSubmitted),
  );
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    () => cachedState?.isCollapsed ?? defaultCollapsed,
  );

  useEffect(() => {
    if (!initialSubmittedAnswers) {
      return;
    }
    setSelectedAnswers(initialSubmittedAnswers);
    setIsSubmitted(true);
  }, [initialSubmittedAnswers]);

  useEffect(() => {
    if (!cacheKey) {
      return;
    }
    quizStateCache.set(cacheKey, {
      sessionKey: resolvedSessionKey,
      selectedAnswers,
      isSubmitted,
      currentStep,
      isCollapsed,
    });
  }, [cacheKey, resolvedSessionKey, selectedAnswers, isSubmitted, currentStep, isCollapsed]);

  const totalQuestions = questions.length;
  const safeCurrentStep =
    totalQuestions > 0 ? Math.min(currentStep, totalQuestions - 1) : 0;
  const currentQuestion = questions[safeCurrentStep] ?? null;

  const answeredCount = useMemo(
    () =>
      questions.reduce(
        (count, q) => (selectedAnswers[q.index] !== undefined ? count + 1 : count),
        0,
      ),
    [questions, selectedAnswers],
  );

  const hasAnswerKeys = useMemo(
    () => totalQuestions > 0 && questions.every((q) => q.answer !== null),
    [questions, totalQuestions],
  );

  const allQuestionsAnswered =
    totalQuestions > 0 && answeredCount === totalQuestions;

  const score = useMemo(
    () =>
      questions.reduce((acc, q) => {
        const chosen = selectedAnswers[q.index];
        return chosen && q.answer && chosen === q.answer ? acc + 1 : acc;
      }, 0),
    [questions, selectedAnswers],
  );

  const selectOption = useCallback(
    (questionIndex: number, optionKey: ChatQuizOptionKey) => {
      if (isSubmitted) {
        return;
      }

      const targetQuestion = questions[questionIndex];
      if (!targetQuestion) {
        return;
      }

      setSelectedAnswers((previous) => {
        if (targetQuestion.answer !== null && previous[questionIndex] !== undefined) {
          return previous;
        }
        return {
          ...previous,
          [questionIndex]: optionKey,
        };
      });
    },
    [isSubmitted, questions],
  );

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= totalQuestions) {
        return;
      }
      setCurrentStep(stepIndex);
      setIsCollapsed(false);
    },
    [totalQuestions],
  );

  const goToPrevious = useCallback(() => {
    setCurrentStep((previous) => Math.max(0, previous - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStep((previous) =>
      totalQuestions > 0 ? Math.min(totalQuestions - 1, previous + 1) : 0,
    );
  }, [totalQuestions]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((previous) => !previous);
  }, []);

  const submitQuiz = useCallback(() => {
    if (isSubmitted || !allQuestionsAnswered) {
      return;
    }

    const submission = formatQuizSubmissionPrompt(questions, selectedAnswers);
    setIsSubmitted(true);
    // Keep the card expanded on submit so we don't disrupt the user's current reading view
    onSubmitQuiz?.(submission);
  }, [allQuestionsAnswered, isSubmitted, onSubmitQuiz, questions, selectedAnswers]);

  return {
    currentStep: safeCurrentStep,
    currentQuestion,
    selectedAnswers,
    isSubmitted,
    isCollapsed,
    answeredCount,
    allQuestionsAnswered,
    hasAnswerKeys,
    score,
    totalQuestions,
    canGoPrevious: safeCurrentStep > 0,
    canGoNext: safeCurrentStep < totalQuestions - 1,
    selectOption,
    goToStep,
    goToPrevious,
    goToNext,
    toggleCollapsed,
    submitQuiz,
  };
};
