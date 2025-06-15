import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "@/lib/apiConfig";
import Countdown from 'react-countdown';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  examType?: string;
  examYear?: string;
  imageUrl?: string;
  section?: string;
  optionAlphas?: string[];
  optionImages?: string[];
}

interface TestInterfaceProps {
  subject?: string;
  questions?: Question[];
  timeLimit?: number; // in minutes
  onComplete?: (results: {
    score: number;
    totalQuestions: number;
    timeSpent: number;
    answers: Record<number, number>;
    testIntegrity: {
      tabSwitchCount: number;
      tabSwitchHistory: Array<{ timestamp: Date; action: 'left' | 'returned' }>;
    };
  }) => void;
  isPremium?: boolean;
}

interface CountdownRendererProps {
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

// Add custom renderer for countdown
const CountdownRenderer = ({ hours, minutes, seconds, completed }: CountdownRendererProps) => {
  if (completed) {
    return <span className="font-mono text-destructive">Time's up!</span>;
  }

  // Show HH:MM when more than 1 minute remains
  if (minutes > 0) {
    return (
      <span className="font-mono text-lg">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')} hr:mm
      </span>
    );
  }

  // Show MM:SS when less than 1 minute remains
  return (
    <span className="font-mono text-lg text-destructive">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} mm:ss
    </span>
  );
};

const TestInterface = (props: Partial<TestInterfaceProps>) => {
  const location = useLocation();
  const { cbtSessionId, preparedQuestion, examConfig, status: testStatusRaw } = location.state || {};

  // If missing required data, show error
  if (!cbtSessionId || !preparedQuestion || !examConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bold mb-2 text-red-600">Invalid Test Session</div>
        <div className="text-muted-foreground">Could not find test session data. Please start a new test from the dashboard.</div>
      </div>
    );
  }

  // Convert duration (hh:mm:ss) to milliseconds for countdown
  const parseDurationToMilliseconds = (duration: string) => {
    if (!duration) return 0;
    const [h, m, s] = duration.split(":").map(Number);
    return ((h * 60 + m) * 60 + s) * 1000;
  };

  // Remove subject-selection step and related state
  const [currentStep, setCurrentStep] = useState<"summary" | "test" | "results">("summary");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(parseDurationToMilliseconds(examConfig.time) || 0); // in milliseconds
  const [testCompleted, setTestCompleted] = useState(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [currentExplanationQuestion, setCurrentExplanationQuestion] = useState<string | null>(null);
  const [fetchedQuestions, setFetchedQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Add state for tracking tab switches
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [lastTabSwitchTime, setLastTabSwitchTime] = useState<Date | null>(null);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [tabSwitchHistory, setTabSwitchHistory] = useState<Array<{ timestamp: Date, action: 'left' | 'returned' }>>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // Function to enter full screen
  const enterFullScreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error('Failed to enter full screen:', err);
    }
  };

  // Function to exit full screen
  const exitFullScreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Failed to exit full screen:', err);
    }
  };

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (currentStep === 'test') {  // Only track during the test
        const now = new Date();
        
        if (document.hidden) {
          // User left the tab
          setTabSwitchCount(prev => prev + 1);
          setLastTabSwitchTime(now);
          setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'left' }]);
          setShowTabSwitchWarning(true);
        } else {
          // User returned to the tab
          setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'returned' }]);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStep]);

  // Add warning dialog for tab switching
  const TabSwitchWarningDialog = () => (
    <Dialog open={showTabSwitchWarning} onOpenChange={setShowTabSwitchWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Warning: Tab Switch Detected</DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <p className="text-destructive font-semibold">
                You have switched away from the test tab. This action has been recorded.
              </p>
              <p>
                Number of tab switches: {tabSwitchCount}
                {lastTabSwitchTime && (
                  <>
                    <br />
                    Last switch: {lastTabSwitchTime.toLocaleTimeString()}
                  </>
                )}
              </p>
              <p>
                Continuing to switch tabs may result in test invalidation.
                Please remain in the test tab until completion.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setShowTabSwitchWarning(false)}>
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  // Helper to map status number or string to display string
  const mapSessionStatus = (status: number | string) => {
    switch (status) {
      case 1:
      case "not-started":
        return "Not Started";
      case 2:
      case "in-progress":
        return "In Progress";
      case 3:
      case "submitted":
        return "Submitted";
      case 4:
      case "cancelled":
        return "Cancelled";
      default:
        return "Not Started";
    }
  };

  // Map API response to internal format
  const mappedQuestions = fetchedQuestions.map((q, idx) => ({
    id: q.questionId,
    text: q.questionContent,
    options: q.optionCommandResponses.map((o: any) => o.optionContent),
    subject: q.subjectName,
    examType: q.examType,
    examYear: q.examYear,
    imageUrl: q.imageUrl,
    section: q.section ? `Section: ${q.section}` : undefined,
    optionAlphas: q.optionCommandResponses.map((o: any) => o.optionAlpha),
    optionImages: q.optionCommandResponses.map((o: any) => o.imageUrl),
    correctAnswer: undefined, // Not available from API
  }));

  // Use mappedQuestions if available, else fallback to props.questions
  const questions = mappedQuestions.length > 0 ? mappedQuestions : (props.questions || []);

  // Calculate progress
  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

  // Format time remaining
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Jump to specific question
  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Start button handler
  const handleStartTest = async () => {
    setLoadingQuestions(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("token");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await api.get(`/api/v1/cbtsessions/${cbtSessionId}/questions/paid`);
      if (res.data?.isSuccess && Array.isArray(res.data.value.groupedQuestionCommandQueryResponses)) {
        await enterFullScreen(); // Enter full screen before starting test
        setFetchedQuestions(res.data.value.groupedQuestionCommandQueryResponses);
        setCurrentStep("test");
        setCurrentQuestionIndex(0);
        setAnswers({});
      } else {
        setFetchError(res.data?.message || "Failed to fetch questions");
      }
    } catch (err: any) {
      setFetchError(err.response?.data?.message || err.message || "Failed to fetch questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Submit test
  const submitTest = () => {
    exitFullScreen(); // Exit full screen when test is completed
    setTestCompleted(true);
    setCurrentStep("results");

    // Calculate score
    let score = 0;
    Object.entries(answers).forEach(([questionId, answerIndex]) => {
      const question = questions.find((q) => q.id === parseInt(questionId));
      if (question && question.correctAnswer === answerIndex) {
        score++;
      }
    });

    // Include tab switch data in results
    const testResults = {
      score,
      totalQuestions: questions.length,
      timeSpent: timeRemaining,
      answers,
      testIntegrity: {
        tabSwitchCount,
        tabSwitchHistory,
      }
    };

    // Call onComplete callback with results
    props.onComplete?.(testResults);
  };

  // Show explanation dialog
  const showExplanation = (questionId: number) => {
    setCurrentExplanationQuestion(questionId.toString());
    setShowExplanationDialog(true);
  };

  // Calculate result statistics
  const calculateResults = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((question) => {
      const hasCorrect = typeof question.correctAnswer === "number";
      if (answers[question.id] === undefined) {
        unattempted++;
      } else if (hasCorrect && answers[question.id] === question.correctAnswer) {
        correct++;
      } else if (hasCorrect) {
        incorrect++;
      }
    });

    return { correct, incorrect, unattempted };
  };

  const results = calculateResults();

  // Handle countdown completion
  const handleCountdownComplete = () => {
    // Auto-submit the test when time is up
    submitTest();
  };

  // --- UI ---
  return (
    <div className="bg-background min-h-screen p-4 md:p-8">
      {/* Add fullscreen warning if user exits fullscreen */}
      {currentStep === "test" && !isFullScreen && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: Full Screen Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Please maintain full screen mode during the test.</span>
            <Button onClick={enterFullScreen} variant="outline" size="sm">
              Return to Full Screen
            </Button>
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
                {/* Status Display */}
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
                {fetchError && <div className="text-red-600 mt-4 text-center">{fetchError}</div>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button size="lg" onClick={handleStartTest} disabled={loadingQuestions}>
                {loadingQuestions ? "Loading..." : "Start Test"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      {currentStep === "test" && questions.length > 0 && (
        <div className="max-w-7xl mx-auto">
          {/* Warning Banner */}
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Test Integrity</AlertTitle>
            <AlertDescription>
              The use of external resources, calculators, or any unauthorized materials during this test is strictly prohibited. 
              Any violation will result in immediate test invalidation. Maintain academic integrity by relying solely on your knowledge.
            </AlertDescription>
          </Alert>

          {/* Test Progress at the top */}
          {/* <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Test Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2" />
              <div className="mt-2 text-sm text-muted-foreground">
                {Object.keys(answers).length} of {questions.length}{" "}
                questions answered
              </div>
            </CardContent>
          </Card> */}

          {/* Question card, same width as Test Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-lg font-medium">
                    {questions[currentQuestionIndex].subject}
                  </Badge>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <Countdown
                      date={Date.now() + parseDurationToMilliseconds(examConfig.time)}
                      renderer={CountdownRenderer}
                      onComplete={handleCountdownComplete}
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Section display */}
                {questions[currentQuestionIndex].section && (
                  <div 
                    className="text-sm font-medium text-muted-foreground mb-4"
                    dangerouslySetInnerHTML={createMarkup(questions[currentQuestionIndex].section)}
                  />
                )}

                <div 
                  className="text-lg"
                  dangerouslySetInnerHTML={createMarkup(questions[currentQuestionIndex].text)}
                />
                {/* Show image if available */}
                {questions[currentQuestionIndex].imageUrl && (
                  <img
                    src={questions[currentQuestionIndex].imageUrl}
                    alt="Question Illustration"
                    className="max-w-full my-4 rounded"
                  />
                )}
                {/* examType-examYear below the question, small and italic */}
                <div className="mt-1">
                  <i className="text-s text-muted-foreground">
                    {questions[currentQuestionIndex].examType?.toLowerCase()}-{questions[currentQuestionIndex].examYear}
                  </i>
                </div>

                <RadioGroup
                  value={
                    answers[questions[currentQuestionIndex].id] !== undefined
                      ? answers[questions[currentQuestionIndex].id].toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    handleAnswerSelect(
                      questions[currentQuestionIndex].id.toString(),
                      parseInt(value),
                    )
                  }
                >
                  {questions[currentQuestionIndex].options.map(
                    (option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${questions[currentQuestionIndex].id}-${index}`}
                        />
                        <Label
                          htmlFor={`option-${questions[currentQuestionIndex].id}-${index}`}
                          className="flex-grow cursor-pointer"
                        >
                          <div dangerouslySetInnerHTML={createMarkup(option)} />
                        </Label>
                      </div>
                    ),
                  )}
                </RadioGroup>
              </div>

              {/* Navigation buttons moved here, left aligned */}
              <div className="mt-6 flex justify-start gap-4">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                <Button 
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Question Navigator below question, full width */}
              <div className="mt-8">
                <Card className="shadow-none border-none p-0">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-lg">Question Navigator</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-wrap gap-2">
                      {questions.map((_, index) => (
                        <Button
                          key={index}
                          variant={
                            answers[questions[index].id] !== undefined
                              ? "default"
                              : "outline"
                          }
                          className={`h-10 w-10 p-0 ${currentQuestionIndex === index ? "ring-2 ring-primary" : ""}`}
                          onClick={() => jumpToQuestion(index)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary rounded-full"></div>
                        <span className="text-sm">Answered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border rounded-full"></div>
                        <span className="text-sm">Unanswered</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Submit button always at bottom */}
              <div className="mt-8 flex justify-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="lg" 
                      disabled={currentQuestionIndex !== questions.length - 1}
                      variant={currentQuestionIndex === questions.length - 1 ? "default" : "outline"}
                    >
                      {currentQuestionIndex === questions.length - 1 ? "Submit Test" : "Jump to the last question to submit"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit Test</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit your test? You have
                        answered {Object.keys(answers).length} out of{" "}
                        {questions.length} questions.
                        {Object.keys(answers).length < questions.length && (
                          <p className="mt-2 text-destructive">
                            You have{" "}
                            {questions.length - Object.keys(answers).length}{" "}
                            unanswered questions.
                          </p>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={submitTest}>
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
            </CardFooter>
          </Card>
        </div>
      )}

      {currentStep === "results" && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-6 border rounded-md">
                  <div className="text-4xl font-bold text-primary">
                    {results.correct}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Correct
                  </div>
                </div>
                <div className="p-6 border rounded-md">
                  <div className="text-4xl font-bold text-destructive">
                    {results.incorrect}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Incorrect
                  </div>
                </div>
                <div className="p-6 border rounded-md">
                  <div className="text-4xl font-bold text-muted-foreground">
                    {results.unattempted}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Unattempted
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">
                    {Math.round((results.correct / questions.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {results.correct} out of {questions.length} questions
                    answered correctly
                  </div>
                </div>
                <Progress
                  value={(results.correct / questions.length) * 100}
                  className="h-3"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Question Review</h3>
                {questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const hasCorrect = typeof question.correctAnswer === "number";
                  const isCorrect = hasCorrect && userAnswer === question.correctAnswer;
                  const isUnattempted = userAnswer === undefined;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-md ${hasCorrect ? (isCorrect ? "border-green-200 bg-green-50" : isUnattempted ? "border-gray-200" : "border-red-200 bg-red-50") : "border-gray-200"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Q{index + 1}.</span>
                          {hasCorrect ? (
                            isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : isUnattempted ? (
                              <AlertCircle className="h-5 w-5 text-gray-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        {hasCorrect && !isCorrect && !isUnattempted && (
                          <Dialog
                            open={
                              showExplanationDialog &&
                              currentExplanationQuestion === question.id.toString()
                            }
                            onOpenChange={(open) => {
                              if (!open) setShowExplanationDialog(false);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => showExplanation(question.id)}
                              >
                                <HelpCircle className="h-4 w-4" />
                                Why?
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Question Explanation</DialogTitle>
                              </DialogHeader>
                              {props.isPremium ? (
                                <div className="space-y-4">
                                  <p className="text-lg">{question.text}</p>
                                  <div className="p-4 bg-muted rounded-md">
                                    <p className="font-medium">Explanation:</p>
                                    <p className="mt-2">
                                      This is a detailed explanation of why
                                      option {question.correctAnswer !== undefined ? String.fromCharCode(65 + question.correctAnswer) : "?"} is the correct answer. The explanation
                                      would include the mathematical concepts,
                                      formulas, and step-by-step solution.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center p-6 space-y-4">
                                  <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                                  <DialogDescription>
                                    <p className="text-lg font-medium">
                                      Premium Feature
                                    </p>
                                    <p className="mt-2">
                                      Detailed explanations are available to
                                      premium subscribers only. Upgrade your
                                      account to access AI-powered explanations
                                      for all questions.
                                    </p>
                                  </DialogDescription>
                                  <DialogFooter>
                                    <Button className="w-full">
                                      Upgrade to Premium
                                    </Button>
                                  </DialogFooter>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      <p className="mt-2">{question.text}</p>

                      <div className="mt-3 space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-md ${hasCorrect && optIndex === question.correctAnswer ? "bg-green-100 border-green-200" : hasCorrect && optIndex === userAnswer ? "bg-red-100 border-red-200" : ""}`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                            {hasCorrect && optIndex === question.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep("summary");
                setAnswers({});
                setCurrentQuestionIndex(0);
                setTimeRemaining(parseDurationToMilliseconds(examConfig.time) || 0);
                setTestCompleted(false);
              }}
            >
              Take Another Test
            </Button>
            <Button>View Performance Analytics</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default TestInterface;
