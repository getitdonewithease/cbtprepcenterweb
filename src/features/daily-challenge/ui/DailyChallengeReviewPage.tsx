import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ReviewView, type ReviewQuestion } from "@/features/practice";
import { useDailyChallengeReview } from "../hooks/useDailyChallengeReview";
import StreakSurgeModal from "./StreakSurgeModal";

/**
 * The daily challenge review: loads one day's answers and shows them in the shared review
 * view (the same page as a test review). The streak pop-up still follows a fresh finish.
 */

const formatDay = (dateString?: string): string => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

export const DailyChallengeReviewPage = () => {
  const { date } = useParams<{ date: string }>();
  const location = useLocation();
  const locationState = location.state as { showStreakModal?: boolean; streakCount?: number } | null;
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakCount] = useState<number>(() => locationState?.streakCount ?? 1);

  const { questions, isLateCompletion, loading, error, notFound, refetch } = useDailyChallengeReview(date);

  // The streak pop-up shows once, shortly after a just-finished challenge's review appears
  useEffect(() => {
    if (!loading && !error && locationState?.showStreakModal) {
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowStreakModal(true), 700);
      return () => clearTimeout(timer);
    }
  }, [loading, error, locationState]);

  const mappedQuestions: ReviewQuestion[] = useMemo(
    () =>
      questions.map((q) => {
        const correctIndex = q.options.findIndex((opt) => opt.isCorrect);
        const chosenIndex = q.chosenOption ? q.options.findIndex((opt) => opt.label === q.chosenOption) : -1;
        return {
          id: q.questionId,
          subject: q.subjectName || "Daily challenge",
          text: q.questionContent,
          imageUrl: q.imageUrl ?? undefined,
          options: q.options.map((opt) => opt.content ?? ""),
          optionAlphas: q.options.map((opt) => opt.label),
          optionImages: q.options.map((opt) => opt.imageUrl ?? undefined),
          // No correct option in the data: leave it unmarked rather than guess A
          correctAnswer: correctIndex >= 0 ? correctIndex : undefined,
          userAnswer: chosenIndex >= 0 ? chosenIndex : undefined,
          isCorrect: q.isChosenOptionCorrect,
          // The daily challenge review API sends no explanation (solution) yet
        };
      }),
    [questions],
  );

  const day = formatDay(date);

  return (
    <>
      <ReviewView
        title="Daily challenge review"
        status={loading ? "loading" : error ? "error" : "ready"}
        questions={mappedQuestions}
        detail={day ? `Daily challenge, ${day}${isLateCompletion ? " · done late" : ""}` : undefined}
        back={{ to: "/dashboard", label: "Dashboard" }}
        onRetry={refetch}
        emptyMessage={
          notFound
            ? `You haven't finished the daily challenge for ${day || "this day"}, so there is nothing to review yet.`
            : `There are no answers to review for ${day || "this day"}.`
        }
        emptyAction={notFound && date ? { to: `/daily-challenge/${date}`, label: "Do this challenge" } : undefined}
      />
      <StreakSurgeModal isOpen={showStreakModal} currentStreakCount={streakCount} onClose={() => setShowStreakModal(false)} />
    </>
  );
};

export default DailyChallengeReviewPage;
