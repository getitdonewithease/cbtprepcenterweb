import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle, 
  XCircle, 
  Clock, 
  BookOpen,
  Trophy,
  Target,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { useTestReview, useAIExplanation, useSaveQuestion } from '../hooks/usePractice';
import { useToast } from '@/components/ui/use-toast';
import { ReviewQuestion } from '../types/practiceTypes';
import QuestionReviewCard from './QuestionReviewCard';
import AIChatPanel from './AIChatPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import MathContent from './MathContent';

const orange = "hsl(var(--brand-orange))";
const orangeText = "hsl(25 85% 45%)";
const pageShellClassName = "min-h-screen bg-[#f5f5f3] px-4 py-5 text-[#222] md:px-8 md:py-8";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";
const sectionLabelClassName = "mb-[0.65rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";

const TestReviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isAIChatFullscreen, setIsAIChatFullscreen] = useState(false);
  const [chatPanelSize, setChatPanelSize] = useState(30);
  const mainPanelRef = useRef<ImperativePanelHandle>(null);
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });
  const [selectedQuestion, setSelectedQuestion] = useState<ReviewQuestion | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [userSelectedSubject, setUserSelectedSubject] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const { reviewData, loading, error } = useTestReview(sessionId || '');
  const { explanation, loading: aiLoading, getExplanation, clearExplanation } = useAIExplanation();
  const { saveQuestion, saving } = useSaveQuestion();
  const { toast } = useToast();

  // Group questions by subject - moved before conditional returns
  const questionsBySubject = React.useMemo(() => {
    if (!reviewData?.questions) return {};
    
    return reviewData.questions.reduce((acc, question, index) => {
      const subject = question.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push({ ...question, index });
      return acc;
    }, {} as Record<string, Array<ReviewQuestion & { index: number }>>);
  }, [reviewData?.questions]);

  // Effect to sync selected subject with current question or initialize it
  React.useEffect(() => {
    const subjects = Object.keys(questionsBySubject);
    if (reviewData?.questions && reviewData.questions.length > 0) {
      const currentQuestion = reviewData.questions[currentQuestionIndex];
      // Only auto-set selected subject if user hasn't manually selected one
      if (!userSelectedSubject && subjects.length > 0) {
        if (currentQuestion) {
          setSelectedSubject(currentQuestion.subject);
        } else {
          setSelectedSubject(subjects[0]);
        }
      }
    }
  }, [reviewData?.questions, currentQuestionIndex, questionsBySubject, userSelectedSubject]);

  // Track viewport breakpoint using the same mobile threshold as StudyChatPanel.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
      if (event.matches && showAIChat) {
        setIsAIChatFullscreen(true);
      }
    };

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [showAIChat]);

  // Control panel sizes imperatively to handle open/close, fullscreen, and mobile transitions.
  useEffect(() => {
    if (!showAIChat) {
      chatPanelRef.current?.collapse();
      mainPanelRef.current?.resize(100);
      return;
    }
    if (isMobileViewport) {
      mainPanelRef.current?.collapse();
      chatPanelRef.current?.resize(100);
      return;
    }
    if (isAIChatFullscreen) {
      mainPanelRef.current?.collapse();
      chatPanelRef.current?.resize(100);
      return;
    }
    mainPanelRef.current?.resize(100 - chatPanelSize);
    if (chatPanelSize > 0) {
      chatPanelRef.current?.resize(chatPanelSize);
    }
  }, [showAIChat, isAIChatFullscreen, chatPanelSize, isMobileViewport]);

  // Keep scroll gestures inside the chat panel on mobile fullscreen chat.
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const shouldLockDocumentScroll = isMobileViewport && showAIChat;
    if (!shouldLockDocumentScroll) {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehaviorY = body.style.overscrollBehaviorY;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlOverscrollBehaviorY = documentElement.style.overscrollBehaviorY;

    body.style.overflow = 'hidden';
    body.style.overscrollBehaviorY = 'none';
    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehaviorY = 'none';

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehaviorY = previousBodyOverscrollBehaviorY;
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.overscrollBehaviorY = previousHtmlOverscrollBehaviorY;
    };
  }, [isMobileViewport, showAIChat]);

  if (!sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f3] px-5">
        <Alert variant="destructive" className="max-w-md rounded-[12px] border-[0.5px] shadow-none">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Invalid session ID. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

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
            {error || 'Failed to load test review data. Please try again.'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate(-1)} 
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const { questions, score, totalQuestions, timeSpent, numberOfCorrectAnswers, numberOfWrongAnswers, numberOfQuestionAttempted, accuracy, durationUsed } = reviewData;
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
    // Reset user selection flag when navigating to a question from a different subject
    if (reviewData?.questions && reviewData.questions[index]) {
      const targetQuestion = reviewData.questions[index];
      if (targetQuestion.subject !== selectedSubject) {
        setUserSelectedSubject(false);
      }
      
      // Update sidebar question if it's open; don't auto-fetch explanation (prompt comes from chat input)
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
        title: 'Question Saved',
        description: response.message,
        duration: 5000,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  };

  const handleAIChatOpen = async (question: ReviewQuestion) => {
    setSelectedQuestion(question);
    setShowAIChat(true);
    setIsAIChatFullscreen(isMobileViewport);
    setShowSolution(false);
    
    // Do not auto-fetch explanation; chat input will provide prompt
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
    setIsAIChatFullscreen((previous) => !previous);
  };

  const handleRegenerateExplanation = async () => {
    // No-op: explanation is not auto-seeded; users will type prompts in chat
    return;
  };

  return (
    <div className="h-dvh min-h-0 overflow-hidden bg-[#f5f5f3]">
      <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
        <ResizablePanel
          ref={mainPanelRef}
          defaultSize={100}
          minSize={0}
          collapsible
          collapsedSize={0}
          className="min-w-0 h-full min-h-0"
        >
          <div className={`h-full overflow-y-auto ${pageShellClassName}`}>
            <div className="mx-auto max-w-[1180px]">
              <header className="mb-7">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mb-5 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] text-[#999] transition-colors hover:text-[#555]"
                >
                  <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.75} />
                  <span>Back to dashboard</span>
                </button>

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-[24px] font-medium leading-tight text-[#111]">Test Review</h1>
                    <p className="mt-1 max-w-[560px] text-[14px] leading-normal text-[#666]">
                      Review your answers question by question and use the assistant when you need a clearer explanation.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555]">
                      <Trophy className="h-[14px] w-[14px]" strokeWidth={1.75} />
                      <span>Score {score}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-[7px] border-[0.5px] border-[#e4e4e1] bg-white px-3 py-2 text-[13px] text-[#555]">
                      <Clock className="h-[14px] w-[14px]" strokeWidth={1.75} />
                      <span>{durationUsed}</span>
                    </span>
                    {currentQuestion && (
                      <button
                        type="button"
                        onClick={() => handleAIChatOpen(currentQuestion)}
                        className="inline-flex items-center gap-1.5 rounded-[8px] border-0 px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: orange }}
                      >
                        <Bot className="h-[14px] w-[14px]" strokeWidth={1.75} />
                        <span>AI help</span>
                      </button>
                    )}
                  </div>
                </div>
              </header>

              <section className="mb-7">
                <h2 className={sectionLabelClassName}>Performance overview</h2>
                <div className={cardClassName}>
                  <div className="grid grid-cols-2 border-b-[0.5px] border-[#f0f0f0] md:grid-cols-5">
                    <div className="col-span-2 border-b-[0.5px] border-[#f0f0f0] px-5 py-5 md:col-span-1 md:border-b-0 md:border-r-[0.5px]">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#aaa]">
                        <Target className="h-[13px] w-[13px]" strokeWidth={1.75} />
                        <span>Accuracy</span>
                      </div>
                      <div className="text-[30px] font-medium leading-none text-[#111]">{Math.round(accuracy)}%</div>
                      <p className="mt-2 text-[12px] leading-normal text-[#999]">
                        {numberOfCorrectAnswers} correct out of {totalQuestions}
                      </p>
                    </div>

                    {performanceItems.map((item, index) => (
                      <div
                        key={item.label}
                        className="px-5 py-5"
                        style={{
                          borderRight: index === performanceItems.length - 1 ? "none" : "0.5px solid #f0f0f0",
                        }}
                      >
                        <p className="text-[12px] text-[#aaa]">{item.label}</p>
                        <p className="mt-1 text-[24px] font-medium leading-none" style={{ color: item.color }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-4">
                    <div className="h-[7px] overflow-hidden rounded-full bg-[#eee]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${scorePercent}%`, backgroundColor: orange }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px] text-[#aaa]">
                      <span>Correct answers</span>
                      <span>{Math.round(scorePercent)}%</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-start">
                <aside className="w-full flex-shrink-0 lg:sticky lg:top-8 lg:w-[360px]">
                  <h2 className={sectionLabelClassName}>Questions</h2>
                  <div className={cardClassName}>
                    <div className="flex items-center justify-between border-b-[0.5px] border-[#f0f0f0] px-5 py-[0.875rem]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-[15px] w-[15px] text-[#999]" strokeWidth={1.75} />
                        <span className="text-[14px] font-medium text-[#333]">Navigator</span>
                      </div>
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
                              onClick={() => {
                                setSelectedSubject(subject);
                                setUserSelectedSubject(true);
                              }}
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
                          questionsBySubject[selectedSubject]?.map(({ index, isCorrect, userAnswer }) => {
                            const isCurrent = currentQuestionIndex === index;
                            const wasAttempted = userAnswer !== undefined;
                            const statusColor = isCorrect ? "#287245" : wasAttempted ? "#b6423b" : "#aaa";

                            return (
                              <button
                                key={index}
                                type="button"
                                className="flex aspect-square h-10 w-full items-center justify-center rounded-[8px] border-[0.5px] text-[12px] font-medium transition-colors"
                                style={{
                                  borderColor: isCurrent ? orange : isCorrect ? "#cfe5d6" : wasAttempted ? "#ebd0cd" : "#e8e8e5",
                                  backgroundColor: isCurrent ? "hsl(25 95% 53% / 0.1)" : "#fff",
                                  color: isCurrent ? orangeText : statusColor,
                                }}
                                onClick={() => handleQuestionNavigation(index)}
                              >
                                {isCorrect ? (
                                  <CheckCircle className="h-[15px] w-[15px]" strokeWidth={1.9} />
                                ) : wasAttempted ? (
                                  <XCircle className="h-[15px] w-[15px]" strokeWidth={1.9} />
                                ) : (
                                  index + 1
                                )}
                              </button>
                            );
                          })}
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2 border-t-[0.5px] border-[#f0f0f0] pt-4">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
                          <CheckCircle className="h-[14px] w-[14px] text-[#287245]" strokeWidth={1.9} />
                          <span>Correct</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
                          <XCircle className="h-[14px] w-[14px] text-[#b6423b]" strokeWidth={1.9} />
                          <span>Wrong</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#777]">
                          <span className="h-[10px] w-[10px] rounded-[3px] border-[0.5px] border-[#ccc]" />
                          <span>Skipped</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                <section className="min-w-0 flex-1">
                  {currentQuestion && (
                    <>
                      <h2 className={sectionLabelClassName}>Question review</h2>
                      <div className={cardClassName}>
                        <div className="flex flex-col gap-3 border-b-[0.5px] border-[#f0f0f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[14px] font-medium text-[#333]">
                              Question {currentQuestionIndex + 1} of {questions.length}
                            </p>
                            <p className="mt-1 text-[12px] text-[#aaa]">
                              {currentQuestion.isCorrect ? "Answered correctly" : currentQuestion.userAnswer !== undefined ? "Needs revision" : "Not attempted"}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="rounded-[6px] border-[#e7e7e4] bg-[#fafafa] px-2.5 py-1 text-[12px] font-medium capitalize text-[#666]">
                              {currentQuestion.subject}
                            </Badge>
                            {currentQuestion.examType && currentQuestion.examYear && (
                              <Badge variant="outline" className="rounded-[6px] border-[#e7e7e4] bg-[#fafafa] px-2.5 py-1 text-[12px] font-medium text-[#666]">
                                {currentQuestion.examType.toUpperCase()} {currentQuestion.examYear}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="px-5 py-5">
                          <QuestionReviewCard
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            totalQuestions={questions.length}
                            onSave={() => handleSaveQuestion(currentQuestion.id)}
                            saving={saving}
                            showSolution={showSolution}
                            onToggleSolution={() => setShowSolution(prev => !prev)}
                          />
                          {showSolution && (
                            <div className="mt-6 rounded-[10px] border-[0.5px] border-[#e8e8e5] bg-[#fafafa] p-4">
                              <h3 className="text-[14px] font-medium text-[#333]">Solution</h3>
                              <div className="mt-2 text-[14px] leading-7 text-[#555]">
                                {currentQuestion.solution && currentQuestion.solution.trim().length > 0 ? (
                                  <MathContent content={currentQuestion.solution} />
                                ) : (
                                  <p className="text-[13px] text-[#999]">No solution for this question.</p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 flex items-center justify-between border-t-[0.5px] border-[#f0f0f0] pt-4">
                            <button
                              type="button"
                              onClick={() => handleQuestionNavigation(Math.max(currentQuestionIndex - 1, 0))}
                              disabled={currentQuestionIndex === 0}
                              className="inline-flex items-center gap-1.5 rounded-[8px] border-[0.5px] border-[#e4e4e1] bg-white px-4 py-2 text-[13px] text-[#666] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.75} />
                              <span>Previous</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuestionNavigation(Math.min(currentQuestionIndex + 1, questions.length - 1))}
                              disabled={currentQuestionIndex === questions.length - 1}
                              className="inline-flex items-center gap-1.5 rounded-[8px] border-0 px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                              style={{ backgroundColor: orange }}
                            >
                              <span>Next</span>
                              <ArrowRight className="h-[13px] w-[13px]" strokeWidth={1.75} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className={showAIChat && !isMobileViewport ? '' : 'pointer-events-none opacity-0'}
        />

        <ResizablePanel
          ref={chatPanelRef}
          defaultSize={0}
          collapsedSize={0}
          collapsible
          minSize={isMobileViewport || isAIChatFullscreen ? 100 : 22}
          maxSize={isMobileViewport || isAIChatFullscreen ? 100 : 45}
          onResize={(size) => {
            if (size > 0) setChatPanelSize(size);
          }}
          className="min-w-0"
        >
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default TestReviewPage; 
