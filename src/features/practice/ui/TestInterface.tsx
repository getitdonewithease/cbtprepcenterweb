import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SectionAlertBanner } from "@/components/ui/section-alert-banner";
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Circle } from "lucide-react";
import Countdown from 'react-countdown';
import { usePractice } from "../hooks/usePractice";
import { CountdownRendererProps, Question } from "../types/practiceTypes";
import { getTestQuestions, submitTestResults } from "../api/practiceApi";
import MathContent from "./MathContent";

// Note: CountdownRenderer and other utility components are kept here as they are view-specific.
const CountdownRenderer = ({ hours, minutes, seconds, completed }: CountdownRendererProps) => {
    if (completed) {
      return <span className="font-mono text-destructive">Time's up!</span>;
    }
    return <span className="font-mono text-lg">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>;
};

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";
const pageShellClassName = "min-h-screen bg-[#f5f5f3] px-4 py-5 text-[#222] md:px-8 md:py-8";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";
const sectionLabelClassName = "mb-[0.65rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";

const TestInterface = () => {
  const { cbtSessionId } = useParams<{ cbtSessionId: string }>();
  const navigate = useNavigate();
  const {
    preparedQuestion,
    examConfig,
    testStatusRaw,
    currentQuestionIndex,
    answers,
    testCompleted,
    questions, // usePractice's questions
    loading,   // usePractice's loading
    error,     // usePractice's error
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
    cbtSessionId: practiceCbtSessionId, // This is the state managed by usePractice, not directly used here
    exitFullScreen,
    endTime,
    startTime,
    isDesktopDevice,
  } = usePractice(cbtSessionId);

  const currentQuestion: Question | undefined = questions[currentQuestionIndex];

  const imageUrl = currentQuestion?.imageUrl ?? "";
  const hasImage = typeof imageUrl === "string" && imageUrl.trim() !== "" && imageUrl.toLowerCase() !== "null";

  const questionsBySubject = React.useMemo(() => {
    return questions.reduce((acc, question, index) => {
      const subject = question.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push({ ...question, index });
      return acc;
    }, {} as Record<string, Array<Question & { index: number }>>);
  }, [questions]);

  // State for the selected subject tab
  const [selectedSubject, setSelectedSubject] = React.useState<string>("");

  // Effect to sync selected subject with current question or initialize it
  React.useEffect(() => {
    const subjects = Object.keys(questionsBySubject);
    if (currentQuestion) {
      setSelectedSubject(currentQuestion.subject);
    } else if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [currentQuestion, questionsBySubject]);

  // Effect to automatically enter full screen when questions are loaded (desktop only)
  React.useEffect(() => {
    if (questions.length > 0 && !isFullScreen && isDesktopDevice) {
      enterFullScreen();
    }
    // Only run when questions are loaded or fullscreen state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, isFullScreen, isDesktopDevice]);

  // Ensure test step is set and anti-cheat is active on mount
  React.useEffect(() => {
    if (questions.length === 0 && !endTime && handleStartTest) {
      handleStartTest();
    }
  }, []);

  const mapSessionStatus = (status: number | string) => {
    const statusMap: Record<string, string> = { '1': "Not Started", '2': "In-Progress", '3': "Submitted", '4': "Cancelled" };
    return typeof status === 'number' ? statusMap[status.toString()] || "Unknown" : status;
  };

  const TabSwitchWarningDialog = () => (
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

  const [submissionStatus, setSubmissionStatus] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Helper to convert answer index to letter (A, B, ...)
  const indexToLetter = (index: number) => String.fromCharCode(65 + index);

  // Calculate unanswered questions
  const unansweredCount = questions.length - Object.keys(answers).length;

  // Update handleSubmitTest
  const handleSubmitTestNew = async () => {
    setSubmissionStatus(null);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const questionAnswers = questions.map((q) => {
        const idx = answers[q.id];
        const alpha = typeof idx === "number"
          ? (q.optionAlphas && q.optionAlphas[idx] ? q.optionAlphas[idx] : indexToLetter(idx))
          : 'X';
        return { questionId: q.id, chosenOption: alpha };
      });
      // Calculate remaining time from endTime
      const timeRemainingSeconds = Math.max(0, Math.floor(((effectiveEndTime ?? 0) - Date.now()) / 1000));
      const hours = Math.floor(timeRemainingSeconds / 3600);
      const minutes = Math.floor((timeRemainingSeconds % 3600) / 60);
      const seconds = timeRemainingSeconds % 60;
      const remainingTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

  const effectiveEndTime = endTime;

  // Remove currentStep and step logic

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

  // Main questions UI
  return (
    <div className={pageShellClassName}>
      {questions.length > 0 && (
        <div className="mx-auto max-w-[1180px]">
          <TabSwitchWarningDialog />

          <header className="mb-7 flex justify-end">
            <div className="flex items-center justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555]">
                <Clock className="h-[14px] w-[14px]" strokeWidth={1.75} />
                <Countdown date={effectiveEndTime} renderer={CountdownRenderer} onComplete={handleCountdownComplete} />
              </span>
            </div>
          </header>

          <div className="mb-7 space-y-3">
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

            {/* <div className="rounded-[12px] border-[0.5px] border-[#ead9ca] bg-[#fffaf6] px-4 py-3 text-[13px] leading-6 text-[#7a5b42]">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-1 h-[14px] w-[14px] shrink-0" strokeWidth={1.75} />
                  <p>
                    External resources, calculators, AI tools, and unauthorized materials are prohibited during this test.
                  </p>
                </div>
              </div> */}
          </div>

          <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-start">
            <aside className="w-full flex-shrink-0 lg:sticky lg:top-8 lg:w-[360px]">
              <h2 className={sectionLabelClassName}>Questions</h2>
              <div className={cardClassName}>
                <div className="flex items-center justify-between border-b-[0.5px] border-[#f0f0f0] px-5 py-[0.875rem]">
                  <span className="text-[14px] font-medium text-[#333]">Navigator</span>
                  <span className="text-[12px] text-[#aaa]">{currentQuestionIndex + 1} / {questions.length}</span>
                </div>

                <div className="border-b-[0.5px] border-[#f0f0f0] px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(questionsBySubject).map((subject) => {
                      const isSelected = selectedSubject === subject;

                      return (
                        <button
                          key={subject}
                          type="button"
                          className="rounded-[7px] px-3 py-1.5 text-[12px] capitalize transition-colors"
                          style={{
                            backgroundColor: isSelected ? "hsl(25 95% 53% / 0.1)" : "#f7f7f5",
                            color: isSelected ? orangeText : "#777",
                          }}
                          onClick={() => setSelectedSubject(subject)}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="grid grid-cols-6 gap-2">
                    {selectedSubject &&
                      questionsBySubject[selectedSubject]?.map(({ index, id }, subjectIdx) => {
                        const isCurrent = currentQuestionIndex === index;
                        const isAnswered = answers[id] !== undefined;

                        return (
                          <button
                            key={index}
                            type="button"
                            className="flex aspect-square h-10 w-full items-center justify-center rounded-[8px] border-[0.5px] text-[12px] font-medium transition-colors"
                            style={{
                              borderColor: isCurrent ? orange : isAnswered ? "#cfe5d6" : "#e8e8e5",
                              backgroundColor: isCurrent ? "hsl(25 95% 53% / 0.1)" : "#fff",
                              color: isCurrent ? orangeText : isAnswered ? "#287245" : "#999",
                            }}
                            onClick={() => jumpToQuestion(index)}
                          >
                            {isAnswered ? <CheckCircle className="h-[15px] w-[15px]" strokeWidth={1.9} /> : subjectIdx + 1}
                          </button>
                        );
                      })}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 border-t-[0.5px] border-[#f0f0f0] pt-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
                      <CheckCircle className="h-[14px] w-[14px] text-[#287245]" strokeWidth={1.9} />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
                      <Circle className="h-[14px] w-[14px] text-[#aaa]" strokeWidth={1.9} />
                      <span>Unanswered</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="min-w-0 flex-1">
              <h2 className={sectionLabelClassName}>Current question</h2>
              <div className={cardClassName}>
                <div className="flex flex-col gap-3 border-b-[0.5px] border-[#f0f0f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#333]">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                    <p className="mt-1 text-[12px] text-[#aaa]">
                      {answers[currentQuestion.id] !== undefined ? "Answered" : "Not answered yet"}
                    </p>
                  </div>

                  {currentQuestion.examType || currentQuestion.examYear ? (
                    <span className="w-fit rounded-[6px] border-[0.5px] border-[#e7e7e4] bg-[#fafafa] px-2.5 py-1 text-[12px] font-medium text-[#666]">
                      {currentQuestion.examType?.toUpperCase()} {currentQuestion.examYear}
                    </span>
                  ) : null}
                </div>

                <div className="px-5 py-5">
                  <div className="space-y-6">
                    {currentQuestion.section && (
                      <MathContent
                        content={currentQuestion.section}
                        className="mb-4 text-[13px] font-medium leading-6 text-[#888]"
                      />
                    )}
                    <MathContent content={currentQuestion.text} className="text-[16px] leading-8 text-[#222]" />
                    {hasImage && (
                      <img
                        src={imageUrl}
                        alt="Question illustration"
                        className="my-4 h-auto max-w-full rounded-[10px] border-[0.5px] border-[#e8e8e5]"
                      />
                    )}

                    <RadioGroup
                      key={currentQuestion.id}
                      value={answers[currentQuestion.id]?.toString()}
                      onValueChange={(value) => handleAnswerSelect(currentQuestion.id.toString(), parseInt(value, 10))}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = answers[currentQuestion.id] === index;

                        return (
                          <Label
                            key={`${currentQuestion.id}-${index}`}
                            htmlFor={`option-${currentQuestion.id}-${index}`}
                            className="flex cursor-pointer items-start gap-3 rounded-[10px] border-[0.5px] p-4 transition-colors"
                            style={{
                              borderColor: isSelected ? "hsl(25 95% 53% / 0.35)" : "#e8e8e5",
                              backgroundColor: isSelected ? "hsl(25 95% 53% / 0.08)" : "#fff",
                            }}
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${currentQuestion.id}-${index}`}
                              className="mt-1"
                            />
                            <span className="min-w-0 flex-1 text-[14px] leading-7 text-[#444]">
                              <MathContent content={option} inline />
                            </span>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-[0.5px] border-[#f0f0f0] pt-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="rounded-[8px] border-[0.5px] border-[#e4e4e1] bg-white text-[13px] text-[#666] shadow-none hover:bg-[#fafafa]"
                      >
                        <ChevronLeft className="mr-1.5 h-[13px] w-[13px]" strokeWidth={1.75} /> Previous
                      </Button>
                      <Button
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="rounded-[8px] border-0 text-[13px] font-medium text-white shadow-none hover:opacity-90"
                        style={{ backgroundColor: orange }}
                      >
                        Next <ChevronRight className="ml-1.5 h-[13px] w-[13px]" strokeWidth={1.75} />
                      </Button>
                    </div>

                    <div className="flex min-w-0 flex-1 justify-end">
                      {submitError ? (
                        <div className="mr-3 min-w-[220px] flex-1">
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
                                  You have {unansweredCount} unanswered {unansweredCount === 1 ? 'question' : 'questions'}. Are you sure you want to submit?
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
                                  <span className="flex items-center"><span className="loader mr-2"></span>Submitting...</span>
                                ) : "Submit"}
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {submissionStatus && (
                    <div className="mt-6 text-center text-[14px] font-medium" style={{ color: orangeText }}>
                      {submissionStatus}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
