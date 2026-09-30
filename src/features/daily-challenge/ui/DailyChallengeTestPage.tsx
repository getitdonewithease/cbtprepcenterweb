import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";
import { useDailyChallengeSession } from "../hooks/useDailyChallengeSession";
import { DailyChallengeQuestion, CompletionStatus } from "../types/dailyChallengeTypes";
import { formatYearMonthDay } from "../service/dailyChallengeService";
import { TestRunnerView, TestRunnerQuestion } from "@/features/practice";

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";

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

export const DailyChallengeTestPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

  const {
    questions,
    currentIndex,
    totalQuestions,
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
    refetch,
  } = useDailyChallengeSession(date);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const handleBackToDashboard = () => {
    if (answeredCount > 0) {
      setShowExitConfirm(true);
    } else {
      navigate("/dashboard");
    }
  };

  const confirmExit = () => {
    navigate("/dashboard");
  };

  const handleCompleteChallenge = async () => {
    try {
      const res = await submitChallenge();
      if (res) {
        setShowSubmitDialog(false);
        const todayString = formatYearMonthDay(new Date());
        const targetDate = date || todayString;
        const isToday = !date || date === todayString;
        const isCompletedOnTime = res.completionStatus === CompletionStatus.Completed;

        if (isToday && isCompletedOnTime) {
          navigate(`/daily-challenge/review/${targetDate}`, {
            state: {
              showStreakModal: true,
              streakCount: res.currentStreakCount ?? 1,
            },
          });
        } else {
          // Late completion or past completion: navigate directly to review
          navigate(`/daily-challenge/review/${targetDate}`);
        }
      }
    } catch (_) {
      // Error is stored in submitError by the hook
    }
  };

  const unansweredCount = questions.length - Object.keys(answers).length;

  // Map daily challenge questions to normalized TestRunnerQuestions
  const runnerQuestions: TestRunnerQuestion<DailyChallengeQuestion>[] = useMemo(() => {
    return questions.map((q) => ({
      id: q.questionId,
      subject: q.subjectName || "Daily Challenge",
      content: q.questionContent,
      imageUrl: q.imageUrl,
      tag: q.subjectName,
      options: q.options.map((opt) => ({
        id: opt.label,
        content: opt.content,
        imageUrl: opt.imageUrl,
        label: opt.label,
      })),
      raw: q,
    }));
  }, [questions]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-[1.5px] border-[#ddd] border-b-[#999]" />
          <p className="text-[14px] text-[#777]">Loading daily challenge...</p>
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
          <h3 className="text-[15px] font-medium text-[#222]">Could not load daily challenge</h3>
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

  // Empty questions state
  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <div className={`w-full max-w-md ${cardClassName} p-6 text-center`}>
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-[15px] font-medium text-[#222]">No questions for this date</h3>
          <p className="mt-1 text-[13px] text-[#777]">
            There are no daily challenge questions available for {formatDateDisplay(date)}.
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

  // Header slot: Dashboard Back + Date + Answered Count
  const headerSlot = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555] shadow-none hover:bg-[#fafafa]"
        >
          <ArrowLeft className="h-[14px] w-[14px]" strokeWidth={1.75} />
          <span>Dashboard</span>
        </Button>

        <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555]">
          <Sparkles className="h-[14px] w-[14px]" style={{ color: orange }} strokeWidth={1.75} />
          <span className="font-medium text-[#333]">Daily Challenge</span>
          {date && (
            <>
              <span className="text-[#ccc]">•</span>
              <span className="text-[#777]">{formatDateDisplay(date)}</span>
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] px-3 py-2 text-[13px] font-medium"
          style={{
            borderColor: "hsl(25 95% 53% / 0.25)",
            backgroundColor: "hsl(25 95% 53% / 0.08)",
            color: orangeText,
          }}
        >
          <CheckCircle2 className="h-[14px] w-[14px]" />
          <span>{answeredCount} of {totalQuestions} answered</span>
        </span>
      </div>
    </header>
  );

  // Alerts / Dialogs slot: Exit confirmation
  const alertsSlot = (
    <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Daily Challenge?</AlertDialogTitle>
          <AlertDialogDescription>
            Your progress is saved, and you can resume this challenge at any time from the calendar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowExitConfirm(false)}>Stay</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={confirmExit}>
              Leave
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Action button slot: Complete Challenge Dialog + Error message
  const actionButtonSlot = (
    <div className="flex items-center">
      {submitError && (
        <div className="mr-3 min-w-[220px]">
          <SectionAlertBanner
            title="Submission failed"
            description={submitError}
            onDismiss={() => setSubmitError(null)}
            className="mb-0"
          />
        </div>
      )}

      <AlertDialog
        open={showSubmitDialog}
        onOpenChange={isSubmitting ? undefined : setShowSubmitDialog}
      >
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={() => setShowSubmitDialog(true)}
            className="rounded-[8px] text-[13px] shadow-none"
            style={currentIndex === questions.length - 1 ? { backgroundColor: "hsl(142 71% 45%)" } : undefined}
          >
            Complete Challenge
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Daily Challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              {unansweredCount > 0 ? (
                <div className="mb-2 text-destructive font-semibold">
                  You have {unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"}. Are you sure you want to complete?
                </div>
              ) : null}
              This will submit your daily challenge for today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleCompleteChallenge}
                disabled={isSubmitting}
                style={{ backgroundColor: "hsl(142 71% 45%)" }}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="loader mr-2" />
                    Submitting...
                  </span>
                ) : (
                  "Complete"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return (
    <TestRunnerView<DailyChallengeQuestion>
      questions={runnerQuestions}
      currentIndex={currentIndex}
      answers={answers}
      onSelectAnswer={(qId, optId) => selectAnswer(qId, optId)}
      onNextQuestion={nextQuestion}
      onPrevQuestion={prevQuestion}
      onJumpToQuestion={jumpToQuestion}
      headerSlot={headerSlot}
      alertsSlot={alertsSlot}
      actionButtonSlot={actionButtonSlot}
    />
  );
};

export default DailyChallengeTestPage;
