import React from "react";
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
import { submitTestResults } from "../api/practiceApi";
import { useNavigate } from "react-router-dom";

// Note: CountdownRenderer and other utility components are kept here as they are view-specific.
const CountdownRenderer = ({ hours, minutes, seconds, completed }: CountdownRendererProps) => {
    if (completed) {
      return <span className="font-mono text-destructive">Time's up!</span>;
    }
    if (minutes > 0) {
      return <span className="font-mono text-lg">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')} hr:mm</span>;
    }
    return <span className="font-mono text-lg text-destructive">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} mm:ss</span>;
};

const TestInterface = () => {
  const {
    preparedQuestion,
    examConfig,
    testStatusRaw,
    currentStep,
    currentQuestionIndex,
    answers,
    timeRemaining,
    testCompleted,
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
    tabSwitchCount,
    cbtSessionId,
  } = usePractice();

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

  const mapSessionStatus = (status: number | string) => {
    const statusMap: Record<string, string> = { '0': "Pending", '1': "In-Progress", '2': "Completed", '3': "Cancelled" };
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
              <p>Number of tab switches: {tabSwitchCount}</p>
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

  // Helper to convert answer index to letter (A, B, ...)
  const indexToLetter = (index: number) => String.fromCharCode(65 + index);

  // Helper to parse duration string (hh:mm:ss) to seconds
  const parseDurationToSeconds = (duration: string) => {
    if (!duration) return 0;
    const [h = 0, m = 0, s = 0] = duration.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  const navigate = useNavigate();

  // Update handleSubmitTest
  const handleSubmitTestNew = async () => {
    setSubmissionStatus(null);
    try {
      const questionAnswers = questions.map((q) => ({
        questionId: q.id,
        chosenOption:
          typeof answers[q.id] === "number"
            ? indexToLetter(answers[q.id])
            : 'X',
      }));
      // Calculate durationUsed in hh:mm:ss format
      const totalSeconds = parseDurationToSeconds(examConfig.time);
      const usedSeconds = totalSeconds - Math.floor(timeRemaining / 1000);
      const hours = Math.floor(usedSeconds / 3600);
      const minutes = Math.floor((usedSeconds % 3600) / 60);
      const seconds = usedSeconds % 60;
      const durationUsed = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const res = await submitTestResults(cbtSessionId, questionAnswers, durationUsed);
      if (res.isSuccess) {
        navigate('/submission-success');
      } else {
        setSubmissionStatus(res.message || "Submission failed. Please try again.");
      }
    } catch (err: any) {
      setSubmissionStatus(err.message || "Submission failed. Please try again.");
    }
  };

  if (!examConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bold mb-2 text-red-600">Invalid Test Session</div>
        <div className="text-muted-foreground">Could not find test session data. Please start a new test from the dashboard.</div>
      </div>
    );
  }

  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="bg-background min-h-screen p-4 md:p-8">
      {currentStep === "test" && !isFullScreen && (
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
      
      {currentStep === "summary" && (
        <div className="max-w-xl mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <Badge variant="outline">{mapSessionStatus(testStatusRaw)}</Badge>
                </div>
                <div className="font-semibold mb-2">Prepared Questions:</div>
                <ul className="mb-4">
                  {Object.entries(preparedQuestion).map(([subject, count]) => (
                    <li key={subject} className="flex justify-between border-b py-1">
                      <span className="capitalize">{subject}</span>
                      <span className="font-bold">{count as number}</span>
                    </li>
                  ))}
                </ul>
                <div className="font-semibold mb-2">Exam Configuration:</div>
                <ul>
                  <li>Time: <span className="font-bold">{examConfig.time}</span></li>
                  <li>Total Questions: <span className="font-bold">{examConfig.questions}</span></li>
                </ul>
                {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button size="lg" onClick={handleStartTest} disabled={loading}>
                {loading ? "Loading..." : "Start Test"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {currentStep === "test" && questions.length > 0 && (
        <>
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Test Integrity</AlertTitle>
            <AlertDescription>
              The use of external resources, calculators, or any unauthorized materials during this test is strictly prohibited. 
              Any violation will result in immediate test invalidation. Maintain academic integrity by relying solely on your knowledge.
            </AlertDescription>
          </Alert>
          <div className="max-w-7xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg font-medium">{currentQuestion.subject}</Badge>
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <Countdown date={Date.now() + timeRemaining} renderer={CountdownRenderer} onComplete={handleCountdownComplete} />
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

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Question Navigator</h3>
                  <div className="flex flex-wrap gap-2 mb-4 border-b pb-2">
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
                  <div className="flex flex-wrap gap-2">
                    {selectedSubject &&
                      questionsBySubject[selectedSubject]?.map(({ index, id }) => (
                        <Button
                          key={index}
                          variant={answers[id] !== undefined ? "default" : "outline"}
                          className={`h-10 w-10 p-0 ${
                            currentQuestionIndex === index ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => jumpToQuestion(index)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                  </div>
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={loading}>Submit Test</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will submit your test for processing.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmitTestNew}>Submit</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                {submissionStatus && (
                  <div className="mt-6 text-center text-lg text-primary font-semibold">{submissionStatus}</div>
                )}
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TestInterface; 