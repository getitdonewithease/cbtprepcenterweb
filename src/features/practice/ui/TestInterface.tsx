import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";
import { Clock, AlertTriangle } from "lucide-react";
import Countdown from "react-countdown";
import { usePractice } from "../hooks/usePractice";
import { CountdownRendererProps, Question } from "../types/practiceTypes";
import { submitTestResults } from "../api/practiceApi";
import { TestRunnerQuestion } from "../types/testRunnerTypes";
import TestRunnerView from "./TestRunnerView";

// Note: CountdownRenderer and other utility components are kept here as they are view-specific.
const CountdownRenderer = ({ hours, minutes, seconds, completed }: CountdownRendererProps) => {
  if (completed) {
    return <span className="font-mono text-destructive">Time's up!</span>;
  }
  return (
    <span className="font-mono text-lg">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
};

const orangeText = "hsl(25 85% 45%)";

const TestInterface = () => {
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const navigate = useNavigate();
  const {
    currentQuestionIndex,
    answers,
    questions,
    loading,
    error,
    isFullScreen,
    showTabSwitchWarning,
    setShowTabSwitchWarning,
    handleStartTest,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    handleAnswerSelect,
    handleCountdownComplete,
    enterFullScreen,
    exitFullScreen,
    endTime,
    isDesktopDevice,
  } = usePractice(cbtSessionId);

  // Effect to automatically enter full screen when questions are loaded (desktop only)
  React.useEffect(() => {
    if (questions.length > 0 && !isFullScreen && isDesktopDevice) {
      enterFullScreen();
    }
  }, [questions.length, isFullScreen, isDesktopDevice, enterFullScreen]);

  // Ensure test step is set and anti-cheat is active on mount
  React.useEffect(() => {
    if (questions.length === 0 && !endTime && handleStartTest) {
      handleStartTest();
    }
  }, [questions.length, endTime, handleStartTest]);

  const [submissionStatus, setSubmissionStatus] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Helper to convert answer index to letter (A, B, ...)
  const indexToLetter = (index: number) => String.fromCharCode(65 + index);

  // Calculate unanswered questions
  const unansweredCount = questions.length - Object.keys(answers).length;

  const effectiveEndTime = endTime;

  // Submit test handler
  const handleSubmitTestNew = async () => {
    if (!cbtSessionId) return;
    setSubmissionStatus(null);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const questionAnswers = questions.map((q) => {
        const idx = answers[q.id];
        const alpha = typeof idx === "number"
          ? (q.optionAlphas && q.optionAlphas[idx] ? q.optionAlphas[idx] : indexToLetter(idx))
          : "X";
        return { questionId: q.id, chosenOption: alpha };
      });
      // Calculate remaining time from endTime
      const timeRemainingSeconds = Math.max(0, Math.floor(((effectiveEndTime ?? 0) - Date.now()) / 1000));
      const hours = Math.floor(timeRemainingSeconds / 3600);
      const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
      const seconds = timeRemainingSeconds % 60;
      const remainingTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      const res = await submitTestResults(cbtSessionId, questionAnswers, remainingTime);
      if (res.isSuccess) {
        exitFullScreen();
        navigate(`/submission-success/${cbtSessionId}`);
      } else {
        setSubmitError(res.message || "Submission failed. Please try again.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  // Map practice questions to normalized TestRunnerQuestions
  const runnerQuestions: TestRunnerQuestion<Question>[] = React.useMemo(() => {
    return questions.map((q) => {
      const tag = [q.examType?.toUpperCase(), q.examYear].filter(Boolean).join(" ");
      return {
        id: q.id,
        subject: q.subject,
        content: q.text,
        section: q.section,
        imageUrl: q.imageUrl,
        tag: tag || undefined,
        options: q.options.map((optText, idx) => ({
          id: idx.toString(),
          content: optText,
          imageUrl: q.optionImages?.[idx] || null,
          label: q.optionAlphas?.[idx] || String.fromCharCode(65 + idx),
        })),
        raw: q,
      };
    });
  }, [questions]);

  // Loading and error UI
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-[1.5px] border-[#ddd] border-b-[#999]" />
          <p className="text-[14px] text-[#777]">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <span className="max-w-md text-center text-[14px] text-red-600">{error}</span>
      </div>
    );
  }

  const TabSwitchWarningDialog = (
    <Dialog open={showTabSwitchWarning} onOpenChange={setShowTabSwitchWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Warning: Tab Switch Detected</DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <p className="text-destructive font-semibold">You have switched away from the test tab. This action has been recorded.</p>
              <p>Continuing to switch tabs may result in test invalidation. Please remain in the test tab until completion.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setShowTabSwitchWarning(false)}>I Understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const headerSlot = (
    <header className="flex justify-end">
      <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555]">
        <Clock className="h-[14px] w-[14px]" strokeWidth={1.75} />
        {effectiveEndTime ? (
          <Countdown date={effectiveEndTime} renderer={CountdownRenderer} onComplete={handleCountdownComplete} />
        ) : null}
      </span>
    </header>
  );

  const alertsSlot = (
    <div className="space-y-3">
      {TabSwitchWarningDialog}

      {!isFullScreen && isDesktopDevice ? (
        <Alert variant="destructive" className="rounded-[12px] border-[0.5px] bg-white shadow-none">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Full screen required</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 text-[13px] sm:flex-row sm:items-center sm:justify-between">
            <span>Please maintain full screen mode during the test.</span>
            <Button onClick={enterFullScreen} variant="outline" size="sm" className="w-fit rounded-[8px] shadow-none">
              Return to full screen
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );

  const actionButtonSlot = (
    <div className="flex items-center">
      {submitError ? (
        <div className="mr-3 min-w-[220px]">
          <SectionAlertBanner
            title="Submission failed"
            description={submitError}
            onDismiss={() => setSubmitError(null)}
            className="mb-0"
          />
        </div>
      ) : null}
      <AlertDialog open={showSubmitDialog} onOpenChange={isSubmitting ? undefined : setShowSubmitDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => setShowSubmitDialog(true)}
            className="rounded-[8px] text-[13px] shadow-none"
          >
            Submit test
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {unansweredCount > 0 ? (
                <div className="mb-2 text-destructive font-semibold">
                  You have {unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"}. Are you sure you want to submit?
                </div>
              ) : null}
              This action cannot be undone. This will submit your test for processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleSubmitTestNew} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="loader mr-2" />
                    Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const footerStatusSlot = submissionStatus ? (
    <div className="text-center text-[14px] font-medium" style={{ color: orangeText }}>
      {submissionStatus}
    </div>
  ) : null;

  return (
    <TestRunnerView<Question>
      questions={runnerQuestions}
      currentIndex={currentQuestionIndex}
      answers={answers}
      onSelectAnswer={(qId, optId) => handleAnswerSelect(qId, parseInt(optId, 10))}
      onNextQuestion={nextQuestion}
      onPrevQuestion={prevQuestion}
      onJumpToQuestion={jumpToQuestion}
      headerSlot={headerSlot}
      alertsSlot={alertsSlot}
      actionButtonSlot={actionButtonSlot}
      footerStatusSlot={footerStatusSlot}
    />
  );
};

export default TestInterface;
