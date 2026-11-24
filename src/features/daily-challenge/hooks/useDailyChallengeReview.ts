import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DailyChallengeCompletionValue,
  DailyChallengeReviewQuestion,
  CompletionStatus,
} from "../types/dailyChallengeTypes";
import { dailyChallengeService } from "../service/dailyChallengeService";
import { getErrorMessage } from "@/core/errors";
import { DAILY_REVIEW_NOT_FOUND } from "../service/dailyChallengeService";

export const useDailyChallengeReview = (date?: string) => {
  const [data, setData] = useState<DailyChallengeCompletionValue | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  /** No finished challenge for this day: an empty state, not an error. */
  const [notFound, setNotFound] = useState(false);

  const loadReview = useCallback(async () => {
    if (!date) {
      setError("No challenge date provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      const result = await dailyChallengeService.getCompletionReview(date);
      setData(result);
      setCurrentIndex(0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === DAILY_REVIEW_NOT_FOUND) {
        setData(null);
        setNotFound(true);
        return;
      }
      setError(getErrorMessage(err, "Failed to load daily challenge review"));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  const questions = useMemo(() => data?.questions || [], [data]);

  const currentQuestion = useMemo(() => {
    if (questions.length === 0 || currentIndex < 0 || currentIndex >= questions.length) {
      return null;
    }
    return questions[currentIndex];
  }, [questions, currentIndex]);

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

  const totalQuestions = data?.totalQuestions ?? questions.length;
  const correctCount = data?.correctCount ?? questions.filter((q) => q.isChosenOptionCorrect).length;
  const score = data?.score ?? correctCount;
  const accuracyPercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const isCompleted = data?.completionStatus === CompletionStatus.Completed;
  const isLateCompletion = data?.completionStatus === CompletionStatus.LateCompletion;

  return {
    data,
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    correctCount,
    accuracyPercentage,
    completionStatus: data?.completionStatus,
    isCompleted,
    isLateCompletion,
    loading,
    error,
    notFound,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    refetch: loadReview,
  };
};
