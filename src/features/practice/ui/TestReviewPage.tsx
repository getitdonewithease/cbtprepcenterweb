import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Clock, Trophy, AlertTriangle, Bot } from "lucide-react";
import { useTestReview, useAIExplanation, useSaveQuestion } from "../hooks/usePractice";
import { useToast } from "@/components/ui/use-toast";
import { ReviewQuestion } from "../types/practiceTypes";
import AIChatPanel from "./AIChatPanel";
import TestReviewView from "./TestReviewView";

const orange = "hsl(var(--brand-orange))";

const TestReviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isAIChatFullscreen, setIsAIChatFullscreen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ReviewQuestion | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  const { reviewData, loading, error } = useTestReview(sessionId || "");
  const { explanation, loading: aiLoading, clearExplanation } = useAIExplanation();
  const { saveQuestion, saving } = useSaveQuestion();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
      if (event.matches && showAIChat) {
        setIsAIChatFullscreen(true);
      }
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, [showAIChat]);

  // Keep scroll gestures inside chat on mobile
  useEffect(() => {
    if (typeof document === "undefined") return;
    const shouldLockDocumentScroll = isMobileViewport && showAIChat;
    if (!shouldLockDocumentScroll) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehaviorY = body.style.overscrollBehaviorY;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlOverscrollBehaviorY = documentElement.style.overscrollBehaviorY;

    body.style.overflow = "hidden";
    body.style.overscrollBehaviorY = "none";
    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehaviorY = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehaviorY = previousBodyOverscrollBehaviorY;
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.overscrollBehaviorY = previousHtmlOverscrollBehaviorY;
    };
  }, [isMobileViewport, showAIChat]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-[1.5px] border-[#ddd] border-b-[#999]" />
          <p className="text-[14px] text-[#777]">Loading test review...</p>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f3] px-5">
        <Alert variant="destructive" className="max-w-md rounded-[12px] border-[0.5px] shadow-none">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load test review data. Please try again."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const {
    questions,
    score,
    totalQuestions,
    numberOfCorrectAnswers,
    numberOfWrongAnswers,
    numberOfQuestionAttempted,
    accuracy,
    durationUsed,
  } = reviewData;

  const currentQuestion = questions[currentQuestionIndex];
  const scorePercent = totalQuestions > 0 ? (numberOfCorrectAnswers / totalQuestions) * 100 : 0;
  const unansweredCount = Math.max(totalQuestions - numberOfQuestionAttempted, 0);

  const performanceItems = [
    { label: "Attempted", value: numberOfQuestionAttempted, color: "#786c53" },
    { label: "Correct", value: numberOfCorrectAnswers, color: "#287245" },
    { label: "Incorrect", value: numberOfWrongAnswers, color: "#b6423b" },
    { label: "Unanswered", value: unansweredCount, color: "#999" },
  ];

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowSolution(false);

    if (reviewData?.questions && reviewData.questions[index]) {
      const targetQuestion = reviewData.questions[index];
      if (showAIChat) {
        setSelectedQuestion(targetQuestion);
        clearExplanation();
      }
    }
  };

  const handleSaveQuestion = async (questionId: string) => {
    try {
      const response = await saveQuestion(sessionId!, questionId);
      toast({
        title: "Question Saved",
        description: response.message,
        duration: 5000,
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to save question:", err);
    }
  };

  const handleAIChatOpen = async (question: ReviewQuestion) => {
    setSelectedQuestion(question);
    setShowAIChat(true);
    setIsAIChatFullscreen(isMobileViewport);
    setShowSolution(false);
  };

  const handleAIChatClose = () => {
    setShowAIChat(false);
    setIsAIChatFullscreen(false);
    clearExplanation();
    setSelectedQuestion(null);
  };

  const handleToggleAIChatFullscreen = () => {
    if (isMobileViewport) {
      setShowAIChat(true);
      setIsAIChatFullscreen(true);
      return;
    }
    setShowAIChat(true);
    setIsAIChatFullscreen((prev) => !prev);
  };

  const handleRegenerateExplanation = async () => {
    return;
  };

  const headerChipsSlot = (
    <>
      <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555]">
        <Trophy className="h-[14px] w-[14px]" strokeWidth={1.75} />
        <span>Score {score}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555]">
        <Clock className="h-[14px] w-[14px]" strokeWidth={1.75} />
        <span>{durationUsed}</span>
      </span>
    </>
  );

  const headerActionsSlot = currentQuestion ? (
    <button
      type="button"
      onClick={() => handleAIChatOpen(currentQuestion)}
      className="inline-flex items-center gap-1.5 rounded-[8px] border-0 px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: orange }}
    >
      <Bot className="h-[14px] w-[14px]" strokeWidth={1.75} />
      <span>AI help</span>
    </button>
  ) : null;

  const chatPanelSlot = (
    <AIChatPanel
      question={selectedQuestion}
      allQuestions={questions}
      explanation={explanation}
      loading={aiLoading}
      onGetExplanation={handleRegenerateExplanation}
      onClose={handleAIChatClose}
      onToggleFullscreen={handleToggleAIChatFullscreen}
      isFullscreen={isMobileViewport || isAIChatFullscreen}
      isMobileView={isMobileViewport}
      showReferences
    />
  );

  return (
    <TestReviewView<ReviewQuestion>
      questions={questions}
      currentIndex={currentQuestionIndex}
      onNextQuestion={() =>
        handleQuestionNavigation(Math.min(currentQuestionIndex + 1, questions.length - 1))
      }
      onPrevQuestion={() => handleQuestionNavigation(Math.max(currentQuestionIndex - 1, 0))}
      onJumpToQuestion={handleQuestionNavigation}
      performance={{
        accuracy,
        totalQuestions,
        correctAnswers: numberOfCorrectAnswers,
        wrongAnswers: numberOfWrongAnswers,
        unattemptedAnswers: unansweredCount,
        scorePercent,
        customMetrics: performanceItems,
      }}
      title="Test Review"
      subtitle="Review your answers question by question and use the assistant when you need a clearer explanation."
      onBack={() => navigate(-1)}
      backLabel="Back to dashboard"
      headerChipsSlot={headerChipsSlot}
      headerActionsSlot={headerActionsSlot}
      showSolution={showSolution}
      onToggleSolution={() => setShowSolution((prev) => !prev)}
      onSaveQuestion={handleSaveQuestion}
      isSavingQuestion={saving}
      chatPanelSlot={chatPanelSlot}
      showChatPanel={showAIChat}
      isChatFullscreen={isMobileViewport || isAIChatFullscreen}
      onCloseChat={handleAIChatClose}
    />
  );
};

export default TestReviewPage;
