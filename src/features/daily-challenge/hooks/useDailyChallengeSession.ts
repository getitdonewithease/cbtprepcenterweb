import { useState, useEffect, useCallback, useMemo } from "react";
import { DailyChallengeQuestion, DailyChallengeSubmissionValue } from "../types/dailyChallengeTypes";
import { dailyChallengeService } from "../service/dailyChallengeService";
import { getErrorMessage } from "@/core/errors";

export const useDailyChallengeSession = (date?: string) => {
  const [dailyChallengeId, setDailyChallengeId] = useState<string>("");
  const [questions, setQuestions] = useState<DailyChallengeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<DailyChallengeSubmissionValue | null>(null);

  const loadQuestions = useCallback(async () => {
    if (!date) {
      setError("No challenge date provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await dailyChallengeService.getQuestionsForDate(date);
      setDailyChallengeId(result.dailyChallengeId);
      setQuestions(result.questions || []);
      setCurrentIndex(0);
      setAnswers({});
      setSubmissionResult(null);
      setSubmitError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load daily challenge questions"));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const currentQuestion = useMemo(() => {
    if (questions.length === 0 || currentIndex < 0 || currentIndex >= questions.length) {
      return null;
    }
    return questions[currentIndex];
  }, [questions, currentIndex]);

  const selectAnswer = useCallback((questionId: string, optionLabel: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const jumpToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length]
  );

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const submitChallenge = useCallback(async () => {
    if (!dailyChallengeId) {
      const err = "No daily challenge ID available for submission.";
      setSubmitError(err);
      throw new Error(err);
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await dailyChallengeService.submitChallenge(
        dailyChallengeId,
        answers,
        questions
      );
      setSubmissionResult(res);
      return res;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, "Failed to submit daily challenge");
      setSubmitError(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [dailyChallengeId, answers, questions]);

  return {
    dailyChallengeId,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    answers,
    answeredCount,
    loading,
    error,
    isSubmitting,
    submitError,
    setSubmitError,
    submissionResult,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    submitChallenge,
    refetch: loadQuestions,
  };
};

