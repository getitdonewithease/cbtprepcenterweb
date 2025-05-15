import React, { useState } from "react";
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
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lock,
} from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  subject: string;
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
  }) => void;
  isPremium?: boolean;
}

const TestInterface = ({
  subject = "Mathematics",
  questions = [
    {
      id: 1,
      text: "If x² + y² = 25 and x + y = 7, find the value of xy.",
      options: ["12", "24", "10", "16"],
      correctAnswer: 1,
      subject: "Mathematics",
    },
    {
      id: 2,
      text: "Simplify: (3x² - x - 2) ÷ (x - 1)",
      options: ["3x + 2", "3x - 2", "3x + 1", "3x - 1"],
      correctAnswer: 0,
      subject: "Mathematics",
    },
    {
      id: 3,
      text: "Find the derivative of f(x) = 2x³ - 4x² + 3x - 5",
      options: ["6x² - 8x + 3", "6x² - 4x + 3", "2x² - 4x + 3", "6x - 8"],
      correctAnswer: 0,
      subject: "Mathematics",
    },
    {
      id: 4,
      text: "Solve for x: log₃(x) + log₃(x-2) = 1",
      options: ["x = 3", "x = 4", "x = 6", "x = 3 or x = -1"],
      correctAnswer: 1,
      subject: "Mathematics",
    },
    {
      id: 5,
      text: "What is the sum of the first 20 terms of an arithmetic sequence with first term 3 and common difference 4?",
      options: ["830", "840", "850", "860"],
      correctAnswer: 1,
      subject: "Mathematics",
    },
  ],
  timeLimit = 30,
  onComplete = () => {},
  isPremium = false,
}: TestInterfaceProps) => {
  const [currentStep, setCurrentStep] = useState<
    "subject-selection" | "test" | "results"
  >("subject-selection");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // in seconds
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [currentExplanationQuestion, setCurrentExplanationQuestion] = useState<
    number | null
  >(null);

  // Calculate progress
  const progress = (Object.keys(answers).length / questions.length) * 100;

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
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

  // Submit test
  const submitTest = () => {
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

    // Call onComplete callback with results
    onComplete({
      score,
      totalQuestions: questions.length,
      timeSpent: timeLimit * 60 - timeRemaining,
      answers,
    });
  };

  // Start test
  const startTest = () => {
    setCurrentStep("test");
  };

  // Show explanation dialog
  const showExplanation = (questionId: number) => {
    setCurrentExplanationQuestion(questionId);
    setShowExplanationDialog(true);
  };

  // Calculate result statistics
  const calculateResults = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((question) => {
      if (answers[question.id] === undefined) {
        unattempted++;
      } else if (answers[question.id] === question.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return { correct, incorrect, unattempted };
  };

  const results = calculateResults();

  return (
    <div className="bg-background min-h-screen p-4 md:p-8">
      {currentStep === "subject-selection" && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              UTME Practice Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Select Subject</h3>
                <Tabs defaultValue="mathematics" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
                    <TabsTrigger value="english">English</TabsTrigger>
                    <TabsTrigger value="physics">Physics</TabsTrigger>
                    <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="mathematics"
                    className="p-4 border rounded-md"
                  >
                    <p>
                      Mathematics practice test contains 40 questions to be
                      completed in 30 minutes.
                    </p>
                  </TabsContent>
                  <TabsContent
                    value="english"
                    className="p-4 border rounded-md"
                  >
                    <p>
                      English practice test contains 40 questions to be
                      completed in 30 minutes.
                    </p>
                  </TabsContent>
                  <TabsContent
                    value="physics"
                    className="p-4 border rounded-md"
                  >
                    <p>
                      Physics practice test contains 40 questions to be
                      completed in 30 minutes.
                    </p>
                  </TabsContent>
                  <TabsContent
                    value="chemistry"
                    className="p-4 border rounded-md"
                  >
                    <p>
                      Chemistry practice test contains 40 questions to be
                      completed in 30 minutes.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Test Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Number of Questions
                    </p>
                    <p className="text-2xl font-bold">{questions.length}</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground">Time Limit</p>
                    <p className="text-2xl font-bold">{timeLimit} minutes</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground">Pass Mark</p>
                    <p className="text-2xl font-bold">40%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={startTest}>
              Start Test
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentStep === "test" && (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Badge variant="outline" className="text-lg font-medium">
                {selectedSubject}
              </Badge>
            </div>
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-mono text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question navigation panel */}
            <div className="order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
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

              <Card className="mt-4">
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
              </Card>
            </div>

            {/* Question and answer area */}
            <div className="order-1 lg:order-2 lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-lg">
                      {questions[currentQuestionIndex].text}
                    </div>

                    <RadioGroup
                      value={answers[
                        questions[currentQuestionIndex].id
                      ]?.toString()}
                      onValueChange={(value) =>
                        handleAnswerSelect(
                          questions[currentQuestionIndex].id,
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
                              id={`option-${index}`}
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-grow cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ),
                      )}
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={nextQuestion}>
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>Submit Test</Button>
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
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
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
                  const isCorrect = userAnswer === question.correctAnswer;
                  const isUnattempted = userAnswer === undefined;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 border rounded-md ${isCorrect ? "border-green-200 bg-green-50" : isUnattempted ? "border-gray-200" : "border-red-200 bg-red-50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Q{index + 1}.</span>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isUnattempted ? (
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>

                        {!isCorrect && !isUnattempted && (
                          <Dialog
                            open={
                              showExplanationDialog &&
                              currentExplanationQuestion === question.id
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
                              {isPremium ? (
                                <div className="space-y-4">
                                  <p className="text-lg">{question.text}</p>
                                  <div className="p-4 bg-muted rounded-md">
                                    <p className="font-medium">Explanation:</p>
                                    <p className="mt-2">
                                      This is a detailed explanation of why
                                      option{" "}
                                      {String.fromCharCode(
                                        65 + question.correctAnswer,
                                      )}{" "}
                                      is the correct answer. The explanation
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
                            className={`p-2 rounded-md ${optIndex === question.correctAnswer ? "bg-green-100 border-green-200" : optIndex === userAnswer ? "bg-red-100 border-red-200" : ""}`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                            {optIndex === question.correctAnswer && (
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
                setCurrentStep("subject-selection");
                setAnswers({});
                setCurrentQuestionIndex(0);
                setTimeRemaining(timeLimit * 60);
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
