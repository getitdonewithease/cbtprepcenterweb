import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import Countdown from 'react-countdown';
import { usePractice } from "../hooks/usePractice";
import { CountdownRendererProps, Question } from "../types/practiceTypes";
import { getTestQuestions, submitTestResults } from "../api/practiceApi";
import { useToast } from "@/components/ui/use-toast";

// Note: CountdownRenderer and other utility components are kept here as they are view-specific.
const CountdownRenderer = ({ hours, minutes, seconds, completed }: CountdownRendererProps) => {
    if (completed) {
      return <span className="font-mono text-destructive">Time's up!</span>;
    }
    return <span className="font-mono text-lg">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>;
};

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
    isDesktopDevice,
  } = usePractice(cbtSessionId);

  const currentQuestion: Question | undefined = questions[currentQuestionIndex];

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

  const createMarkup = (htmlContent: string) => ({ __html: htmlContent });

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);

  // Helper to convert answer index to letter (A, B, ...)
  const indexToLetter = (index: number) => String.fromCharCode(65 + index);

  // Helper to parse duration string (hh:mm:ss) to seconds
  const parseDurationToSeconds = (duration: string) => {
    if (!duration) return 0;
    const [h = 0, m = 0, s = 0] = duration.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  // Calculate unanswered questions
  const unansweredCount = questions.length - Object.keys(answers).length;

  // Update handleSubmitTest
  const handleSubmitTestNew = async () => {
    setSubmissionStatus(null);
    setIsSubmitting(true);
    try {
      const questionAnswers = questions.map((q) => {
        const idx = answers[q.id];
        const alpha = typeof idx === "number"
          ? (q.optionAlphas && q.optionAlphas[idx] ? q.optionAlphas[idx] : indexToLetter(idx))
          : 'X';
        return { questionId: q.id, chosenOption: alpha };
      });
      // Calculate durationUsed as total duration minus time remaining
      const totalDurationSeconds = parseDurationToSeconds(examConfig.duration);
      // derive remaining time from endTime
      const timeRemainingSeconds = Math.max(0, Math.floor(((effectiveEndTime ?? 0) - Date.now()) / 1000));
      const durationUsedSeconds = totalDurationSeconds - timeRemainingSeconds;
      const hours = Math.floor(durationUsedSeconds / 3600);
      const minutes = Math.floor((durationUsedSeconds % 3600) / 60);
      const seconds = durationUsedSeconds % 60;
      const durationUsed = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const res = await submitTestResults(cbtSessionId, questionAnswers, durationUsed);
      if (res.isSuccess) {
        exitFullScreen();
        navigate(`/submission-success/${cbtSessionId}`);
      } else {
        toast({ title: "Submission Failed", description: res.message || "Submission failed. Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Submission Failed", description: err.message || "Submission failed. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const effectiveEndTime = endTime;

  const progress = (Object.keys(answers).length / questions.length) * 100;

  // Remove currentStep and step logic

  // Loading and error UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-destructive">{error}</span>
      </div>
    );
  }

  // Main questions UI
  return (
    <div className="bg-background min-h-screen p-4 md:p-8">
      {questions.length > 0 && (
        <>
          <div className="max-w-7xl mx-auto space-y-6">
        {!isFullScreen && isDesktopDevice && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Full Screen Required</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Please maintain full screen mode during the test.</span>
              <Button onClick={enterFullScreen} variant="outline" size="sm">Return to Full Screen</Button>
            </AlertDescription>
          </Alert>
        )}
        <TabSwitchWarningDialog />
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Test Integrity</AlertTitle>
            <AlertDescription>
              The use of external resources, calculators, or any unauthorized materials during this test is strictly prohibited. 
              Any violation will result in immediate test invalidation. Maintain academic integrity by relying solely on your knowledge.
            </AlertDescription>
          </Alert>
            <div className="flex w-full gap-8 flex-col lg:flex-row">
              {/* Sidebar: Question Navigation */}
              <aside className="w-full lg:w-96 flex-shrink-0 mb-8 lg:mb-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Question Navigator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Subject Tabs */}
                    <div className="flex gap-2 mb-4 border-b pb-2 overflow-x-auto whitespace-nowrap">
                      {Object.keys(questionsBySubject).map((subject) => (
                        <Button
                          key={subject}
                          variant={selectedSubject === subject ? "secondary" : "ghost"}
                          size="sm"
                          className="capitalize"
                          onClick={() => setSelectedSubject(subject)}
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                    {/* Question Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {selectedSubject &&
                        questionsBySubject[selectedSubject]?.map(({ index, id }, subjectIdx) => (
                          <Button
                            key={index}
                            variant={answers[id] !== undefined ? "default" : "outline"}
                            className={`h-10 w-10 p-0 mb-2 ${
                              currentQuestionIndex === index ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => jumpToQuestion(index)}
                          >
                            {subjectIdx + 1}
                          </Button>
                        ))}
                    </div>
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary rounded-sm"></div>
                        <span className="text-sm">Answered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border rounded-sm"></div>
                        <span className="text-sm">Unanswered</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
              {/* Main Question Area */}
              <section className="flex-1 w-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-lg font-medium">{currentQuestion.subject}</Badge>
                        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <Countdown date={effectiveEndTime} renderer={CountdownRenderer} onComplete={handleCountdownComplete} />
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {currentQuestion.section && <div className="text-sm font-medium text-muted-foreground mb-4" dangerouslySetInnerHTML={createMarkup(currentQuestion.section)} />}
                      <div className="text-lg" dangerouslySetInnerHTML={createMarkup(currentQuestion.text)} />
                      {currentQuestion.imageUrl && <img src={currentQuestion.imageUrl} alt="Question Illustration" className="max-w-full my-4 rounded" />}
                      <div className="mt-1"><i className="text-s text-muted-foreground">{currentQuestion.examType?.toLowerCase()}-{currentQuestion.examYear}</i></div>
                      <RadioGroup key={currentQuestion.id} value={answers[currentQuestion.id]?.toString()} onValueChange={(value) => handleAnswerSelect(currentQuestion.id.toString(), parseInt(value, 10))}>
                        {currentQuestion.options.map((option, index) => (
                          <div key={`${currentQuestion.id}-${index}`} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                            <RadioGroupItem value={index.toString()} id={`option-${currentQuestion.id}-${index}`} />
                            <Label htmlFor={`option-${currentQuestion.id}-${index}`} className="flex-1 cursor-pointer">
                              <div dangerouslySetInnerHTML={createMarkup(option)} />
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="mt-6 flex justify-start gap-4">
                      <Button variant="outline" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                      </Button>
                      <Button onClick={nextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <AlertDialog open={showSubmitDialog} onOpenChange={isSubmitting ? undefined : setShowSubmitDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={loading} onClick={() => setShowSubmitDialog(true)}>Submit Test</Button>
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
                    {submissionStatus && (
                      <div className="mt-6 text-center text-lg text-primary font-semibold">{submissionStatus}</div>
                    )}
                  </CardFooter>
                </Card>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestInterface;