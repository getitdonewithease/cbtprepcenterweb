// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
// import {
//   Alert,
//   AlertDescription,
//   AlertTitle,
// } from "@/components/ui/alert";
// import {
//   Clock,
//   ChevronLeft,
//   ChevronRight,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   HelpCircle,
//   Lock,
//   AlertTriangle,
// } from "lucide-react";
// import { useLocation } from "react-router-dom";
// import api from "@/lib/apiConfig";
// import Countdown from 'react-countdown';

// interface Question {
//   id: number;
//   text: string;
//   options: string[];
//   correctAnswer: number;
//   subject: string;
//   examType?: string;
//   examYear?: string;
//   imageUrl?: string;
//   section?: string;
//   optionAlphas?: string[];
//   optionImages?: string[];
// }

// interface TestInterfaceProps {
//   subject?: string;
//   questions?: Question[];
//   timeLimit?: number; // in minutes
//   onComplete?: (results: {
//     score: number;
//     totalQuestions: number;
//     timeSpent: number;
//     answers: Record<number, number>;
//     testIntegrity: {
//       tabSwitchCount: number;
//       tabSwitchHistory: Array<{ timestamp: Date; action: 'left' | 'returned' }>;
//     };
//   }) => void;
//   isPremium?: boolean;
// }

// interface CountdownRendererProps {
//   hours: number;
//   minutes: number;
//   seconds: number;
//   completed: boolean;
// }

// // Add custom renderer for countdown
// const CountdownRenderer = ({ hours, minutes, seconds, completed }: CountdownRendererProps) => {
//   if (completed) {
//     return <span className="font-mono text-destructive">Time's up!</span>;
//   }

//   // Show HH:MM when more than 1 minute remains
//   if (minutes > 0) {
//     return (
//       <span className="font-mono text-lg">
//         {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')} hr:mm
//       </span>
//     );
//   }

//   // Show MM:SS when less than 1 minute remains
//   return (
//     <span className="font-mono text-lg text-destructive">
//       {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} mm:ss
//     </span>
//   );
// };

// const TestInterface = (props: Partial<TestInterfaceProps>) => {
//   const location = useLocation();
//   const { cbtSessionId, preparedQuestion, examConfig, status: testStatusRaw } = location.state || {};

//   // If missing required data, show error
//   if (!cbtSessionId || !preparedQuestion || !examConfig) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <div className="text-2xl font-bold mb-2 text-red-600">Invalid Test Session</div>
//         <div className="text-muted-foreground">Could not find test session data. Please start a new test from the dashboard.</div>
//       </div>
//     );
//   }

//   // Convert duration (hh:mm:ss) to milliseconds for countdown
//   const parseDurationToMilliseconds = (duration: string) => {
//     if (!duration) return 0;
//     const [h, m, s] = duration.split(":").map(Number);
//     return ((h * 60 + m) * 60 + s) * 1000;
//   };

//   // Remove subject-selection step and related state
//   const [currentStep, setCurrentStep] = useState<"summary" | "test" | "results">("summary");
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState<Record<string, number>>({});
//   const [timeRemaining, setTimeRemaining] = useState(parseDurationToMilliseconds(examConfig.time) || 0); // in milliseconds
//   const [testCompleted, setTestCompleted] = useState(false);
//   const [showExplanationDialog, setShowExplanationDialog] = useState(false);
//   const [currentExplanationQuestion, setCurrentExplanationQuestion] = useState<string | null>(null);
//   const [fetchedQuestions, setFetchedQuestions] = useState<any[]>([]);
//   const [loadingQuestions, setLoadingQuestions] = useState(false);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   // Add state for tracking tab switches
//   const [tabSwitchCount, setTabSwitchCount] = useState(0);
//   const [lastTabSwitchTime, setLastTabSwitchTime] = useState<Date | null>(null);
//   const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
//   const [tabSwitchHistory, setTabSwitchHistory] = useState<Array<{ timestamp: Date, action: 'left' | 'returned' }>>([]);
//   const [isFullScreen, setIsFullScreen] = useState(false);

//   // Handle fullscreen changes
//   useEffect(() => {
//     const handleFullScreenChange = () => {
//       setIsFullScreen(Boolean(document.fullscreenElement));
//     };

//     document.addEventListener('fullscreenchange', handleFullScreenChange);
//     return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
//   }, []);

//   // Function to enter full screen
//   const enterFullScreen = async () => {
//     try {
//       await document.documentElement.requestFullscreen();
//     } catch (err) {
//       console.error('Failed to enter full screen:', err);
//     }
//   };

//   // Function to exit full screen
//   const exitFullScreen = async () => {
//     try {
//       if (document.fullscreenElement) {
//         await document.exitFullscreen();
//       }
//     } catch (err) {
//       console.error('Failed to exit full screen:', err);
//     }
//   };

//   // Handle visibility change
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (currentStep === 'test') {  // Only track during the test
//         const now = new Date();
        
//         if (document.hidden) {
//           // User left the tab
//           setTabSwitchCount(prev => prev + 1);
//           setLastTabSwitchTime(now);
//           setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'left' }]);
//           setShowTabSwitchWarning(true);
//         } else {
//           // User returned to the tab
//           setTabSwitchHistory(prev => [...prev, { timestamp: now, action: 'returned' }]);
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [currentStep]);

//   // Add warning dialog for tab switching
//   const TabSwitchWarningDialog = () => (
//     <Dialog open={showTabSwitchWarning} onOpenChange={setShowTabSwitchWarning}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle className="text-destructive">Warning: Tab Switch Detected</DialogTitle>
//           <DialogDescription>
//             <div className="space-y-4">
//               <p className="text-destructive font-semibold">
//                 You have switched away from the test tab. This action has been recorded.
//               </p>
//               <p>
//                 Number of tab switches: {tabSwitchCount}
//                 {lastTabSwitchTime && (
//                   <>
//                     <br />
//                     Last switch: {lastTabSwitchTime.toLocaleTimeString()}
//                   </>
//                 )}
//               </p>
//               <p>
//                 Continuing to switch tabs may result in test invalidation.
//                 Please remain in the test tab until completion.
//               </p>
//             </div>
//           </DialogDescription>
//         </DialogHeader>
//         <DialogFooter>
//           <Button onClick={() => setShowTabSwitchWarning(false)}>
//             I Understand
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );

//   // Function to safely render HTML content
//   const createMarkup = (htmlContent: string) => {
//     return { __html: htmlContent };
//   };

//   // Helper to map status number or string to display string
//   const mapSessionStatus = (status: number | string) => {
//     switch (status) {
//       case 1:
//       case "not-started":
//         return "Not Started";
//       case 2:
//       case "in-progress":
//         return "In Progress";
//       case 3:
//       case "submitted":
//         return "Submitted";
//       case 4:
//       case "cancelled":
//         return "Cancelled";
//       default:
//         return "Not Started";
//     }
//   };

//   // Map API response to internal format
//   const mappedQuestions = fetchedQuestions.map((q, idx) => ({
//     id: q.questionId,
//     text: q.questionContent,
//     options: q.optionCommandResponses.map((o: any) => o.optionContent),
//     subject: q.subjectName,
//     examType: q.examType,
//     examYear: q.examYear,
//     imageUrl: q.imageUrl,
//     section: q.section ? `Section: ${q.section}` : undefined,
//     optionAlphas: q.optionCommandResponses.map((o: any) => o.optionAlpha),
//     optionImages: q.optionCommandResponses.map((o: any) => o.imageUrl),
//     correctAnswer: undefined, // Not available from API
//   }));

//   // Use mappedQuestions if available, else fallback to props.questions
//   const questions = mappedQuestions.length > 0 ? mappedQuestions : (props.questions || []);

//   // Calculate progress
//   const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

//   // Format time remaining
//   const formatTime = (milliseconds: number) => {
//     const seconds = Math.floor(milliseconds / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
//   };

//   // Handle answer selection
//   const handleAnswerSelect = (questionId: string, optionIndex: number) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [questionId]: optionIndex,
//     }));
//   };

//   // Navigate to next question
//   const nextQuestion = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   // Navigate to previous question
//   const prevQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   // Jump to specific question
//   const jumpToQuestion = (index: number) => {
//     setCurrentQuestionIndex(index);
//   };

//   // Start button handler
//   const handleStartTest = async () => {
//     setLoadingQuestions(true);
//     setFetchError(null);
//     try {
//       const token = localStorage.getItem("token");
//       api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       const res = await api.get(`/api/v1/cbtsessions/${cbtSessionId}/questions/paid`);
//       if (res.data?.isSuccess && Array.isArray(res.data.value.groupedQuestionCommandQueryResponses)) {
//         await enterFullScreen(); // Enter full screen before starting test
//         setFetchedQuestions(res.data.value.groupedQuestionCommandQueryResponses);
//         setCurrentStep("test");
//         setCurrentQuestionIndex(0);
//         setAnswers({});
//       } else {
//         setFetchError(res.data?.message || "Failed to fetch questions");
//       }
//     } catch (err: any) {
//       setFetchError(err.response?.data?.message || err.message || "Failed to fetch questions");
//     } finally {
//       setLoadingQuestions(false);
//     }
//   };

//   // Submit test
//   const submitTest = () => {
//     exitFullScreen(); // Exit full screen when test is completed
//     setTestCompleted(true);
//     setCurrentStep("results");

//     // Calculate score
//     let score = 0;
//     Object.entries(answers).forEach(([questionId, answerIndex]) => {
//       const question = questions.find((q) => q.id === parseInt(questionId));
//       if (question && question.correctAnswer === answerIndex) {
//         score++;
//       }
//     });

//     // Include tab switch data in results
//     const testResults = {
//       score,
//       totalQuestions: questions.length,
//       timeSpent: timeRemaining,
//       answers,
//       testIntegrity: {
//         tabSwitchCount,
//         tabSwitchHistory,
//       }
//     };

//     // Call onComplete callback with results
//     props.onComplete?.(testResults);
//   };

//   // Show explanation dialog
//   const showExplanation = (questionId: number) => {
//     setCurrentExplanationQuestion(questionId.toString());
//     setShowExplanationDialog(true);
//   };

//   // Calculate result statistics
//   const calculateResults = () => {
//     let correct = 0;
//     let incorrect = 0;
//     let unattempted = 0;

//     questions.forEach((question) => {
//       const hasCorrect = typeof question.correctAnswer === "number";
//       if (answers[question.id] === undefined) {
//         unattempted++;
//       } else if (hasCorrect && answers[question.id] === question.correctAnswer) {
//         correct++;
//       } else if (hasCorrect) {
//         incorrect++;
//       }
//     });

//     return { correct, incorrect, unattempted };
//   };

//   const results = calculateResults();

//   // Handle countdown completion
//   const handleCountdownComplete = () => {
//     // Auto-submit the test when time is up
//     submitTest();
//   };

//   // --- UI ---
//   return (
//     <div className="bg-background min-h-screen p-4 md:p-8">
//       {/* Add fullscreen warning if user exits fullscreen */}
//       {currentStep === "test" && !isFullScreen && (
//         <Alert variant="destructive" className="mb-6">
//           <AlertTriangle className="h-4 w-4" />
//           <AlertTitle>Warning: Full Screen Required</AlertTitle>
//           <AlertDescription className="flex items-center justify-between">
//             <span>Please maintain full screen mode during the test.</span>
//             <Button onClick={enterFullScreen} variant="outline" size="sm">
//               Return to Full Screen
//             </Button>
//           </AlertDescription>
//         </Alert>
//       )}
