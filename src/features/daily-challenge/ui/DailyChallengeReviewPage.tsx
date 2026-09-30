import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Trophy,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDailyChallengeReview } from "../hooks/useDailyChallengeReview";
import { TestReviewView, ReviewQuestion } from "@/features/practice";
import StreakSurgeModal from "./StreakSurgeModal";

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";
const cardClassName = "overflow-hidden rounded-[14px] border-[0.5px] border-[#e4e4e1] bg-white shadow-sm";

const formatDateDisplay = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const DailyChallengeReviewPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { showStreakModal?: boolean; streakCount?: number } | null;
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [streakCount] = useState<number>(() => locationState?.streakCount ?? 1);

  const {
    questions,
    currentIndex,
    totalQuestions,
    score,
    correctCount,
    accuracyPercentage,
    isCompleted,
    isLateCompletion,
    loading,
    error,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    refetch,
  } = useDailyChallengeReview(date);

  // Smoothly pop up streak modal 700ms after the review page finishes loading and renders
  useEffect(() => {
    if (!loading && !error && locationState?.showStreakModal) {
      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setShowStreakModal(true);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [loading, error, locationState]);

  // Map DailyChallengeReviewQuestion to normalized ReviewQuestion
  const mappedQuestions: ReviewQuestion[] = useMemo(() => {
    return questions.map((q) => {
      const correctIndex = q.options.findIndex((opt) => opt.isCorrect);
      const chosenIndex = q.chosenOption
        ? q.options.findIndex((opt) => opt.label === q.chosenOption)
        : undefined;

      return {
        id: q.questionId,
        subject: q.subjectName || "Daily Challenge",
        text: q.questionContent,
        imageUrl: q.imageUrl ?? undefined,
        options: q.options.map((opt) => opt.content ?? ""),
        optionAlphas: q.options.map((opt) => opt.label),
        optionImages: q.options.map((opt) => opt.imageUrl ?? undefined),
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
        userAnswer: chosenIndex !== undefined && chosenIndex >= 0 ? chosenIndex : undefined,
        isCorrect: q.isChosenOptionCorrect,
        raw: q,
      } as ReviewQuestion;
    });
  }, [questions]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-[1.5px] border-[#ddd] border-b-[#999]" />
          <p className="text-[14px] text-[#777]">Loading daily challenge review...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <div className={`w-full max-w-md ${cardClassName} p-6 text-center`}>
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="text-[15px] font-medium text-[#222]">Could not load review</h3>
          <p className="mt-1 text-[13px] text-[#777]">{error}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button
              onClick={refetch}
              size="sm"
              className="rounded-[8px] border-0 text-[13px] text-white shadow-none hover:opacity-90"
              style={{ backgroundColor: orange }}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="rounded-[8px] border-[0.5px] border-[#e4e4e1] bg-white text-[13px] text-[#666] shadow-none hover:bg-[#fafafa]"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <div className={`w-full max-w-md ${cardClassName} p-6 text-center`}>
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-[15px] font-medium text-[#222]">No review data available</h3>
          <p className="mt-1 text-[13px] text-[#777]">
            There is no completed challenge data found for {formatDateDisplay(date)}.
          </p>
          <div className="mt-5 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="rounded-[8px] border-[0.5px] border-[#e4e4e1] bg-white text-[13px] text-[#666] shadow-none hover:bg-[#fafafa]"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const wrongCount = Math.max(0, totalQuestions - correctCount);
  const unattemptedCount = questions.filter((q) => !q.chosenOption).length;

  const headerChipsSlot = (
    <>
      {isLateCompletion ? (
        <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[12px] font-semibold text-blue-600">
          <Clock className="h-3.5 w-3.5" />
          Late Completion
        </span>
      ) : isCompleted ? (
        <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[12px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      ) : null}

      <span
        className="inline-flex items-center gap-2 rounded-[7px] border-[0.5px] px-3 py-2 text-[13px] font-medium"
        style={{
          borderColor: "hsl(25 95% 53% / 0.25)",
          backgroundColor: "hsl(25 95% 53% / 0.08)",
          color: orangeText,
        }}
      >
        <Trophy className="h-4 w-4" />
        <span>
          Score: <strong>{score}</strong>/{totalQuestions} ({accuracyPercentage}%)
        </span>
      </span>
    </>
  );

  return (
    <>
      <TestReviewView<ReviewQuestion>
        questions={mappedQuestions}
        currentIndex={currentIndex}
        onNextQuestion={nextQuestion}
        onPrevQuestion={prevQuestion}
        onJumpToQuestion={jumpToQuestion}
        performance={{
          accuracy: accuracyPercentage,
          totalQuestions,
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
          unattemptedAnswers: unattemptedCount,
          scorePercent: accuracyPercentage,
          customMetrics: [
            { label: "Score", value: `${score}/${totalQuestions}`, color: orangeText },
            { label: "Correct", value: correctCount, color: "#287245" },
            { label: "Wrong", value: wrongCount, color: "#b6423b" },
            {
              label: "Status",
              value: isLateCompletion ? "Late" : "On Time",
              color: isLateCompletion ? "#2563eb" : "#287245",
            },
          ],
        }}
        title="Daily Challenge Review"
        subtitle={date ? `Completed on ${formatDateDisplay(date)}` : "Review your answers question by question."}
        onBack={() => navigate("/dashboard")}
        backLabel="Back to dashboard"
        headerChipsSlot={headerChipsSlot}
        hideSaveButton
        hideSolutionButton
      />

      <StreakSurgeModal
        isOpen={showStreakModal}
        currentStreakCount={streakCount}
        onClose={() => setShowStreakModal(false)}
      />
    </>
  );
};

export default DailyChallengeReviewPage;
