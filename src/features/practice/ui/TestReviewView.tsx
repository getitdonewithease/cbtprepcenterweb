import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { TestReviewViewProps } from "../types/testReviewTypes";
import ReviewPerformanceCard from "./ReviewPerformanceCard";
import ReviewQuestionNavigator from "./ReviewQuestionNavigator";
import QuestionReviewCard from "./QuestionReviewCard";
import MathContent from "./MathContent";

const orange = "hsl(var(--brand-orange))";
const pageShellClassName = "min-h-screen bg-[#f5f5f3] px-4 py-5 text-[#222] md:px-8 md:py-8";
const cardClassName = "overflow-hidden rounded-[12px] border-[0.5px] border-[#e4e4e1] bg-white shadow-none";
const sectionLabelClassName = "mb-[0.65rem] text-[11px] font-medium uppercase tracking-[0.08em] text-[#aaa]";

export const TestReviewView = <TRaw,>({
  questions,
  currentIndex,
  onNextQuestion,
  onPrevQuestion,
  onJumpToQuestion,
  performance,
  performanceSlot,
  headerSlot,
  title = "Test Review",
  subtitle = "Review your answers question by question and use the assistant when you need a clearer explanation.",
  onBack,
  backLabel = "Back to dashboard",
  headerChipsSlot,
  headerActionsSlot,
  showSolution,
  onToggleSolution,
  onSaveQuestion,
  isSavingQuestion = false,
  hideSaveButton = false,
  hideSolutionButton = false,
  chatPanelSlot,
  showChatPanel = false,
  isChatFullscreen = false,
  containerClassName = "",
}: TestReviewViewProps<TRaw>) => {
  const currentQuestion = questions[currentIndex];

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [userSelectedSubject, setUserSelectedSubject] = useState(false);

  // Sync selected subject with currentQuestion
  useEffect(() => {
    if (currentQuestion?.subject && !userSelectedSubject) {
      setSelectedSubject(currentQuestion.subject);
    } else if (questions.length > 0 && !selectedSubject) {
      setSelectedSubject(questions[0].subject || "General");
    }
  }, [currentQuestion?.subject, questions, userSelectedSubject, selectedSubject]);

  // Handle panel resizing for optional side chat panel
  const mainPanelRef = useRef<ImperativePanelHandle>(null);
  const chatPanelRef = useRef<ImperativePanelHandle>(null);
  const [chatPanelSize, setChatPanelSize] = useState(30);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };
    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (!chatPanelSlot || !showChatPanel) {
      chatPanelRef.current?.collapse();
      mainPanelRef.current?.resize(100);
      return;
    }
    if (isMobileViewport || isChatFullscreen) {
      mainPanelRef.current?.collapse();
      chatPanelRef.current?.resize(100);
      return;
    }
    mainPanelRef.current?.resize(100 - chatPanelSize);
    if (chatPanelSize > 0) {
      chatPanelRef.current?.resize(chatPanelSize);
    }
  }, [chatPanelSlot, showChatPanel, isChatFullscreen, chatPanelSize, isMobileViewport]);

  if (!questions || questions.length === 0 || !currentQuestion) {
    return null;
  }

  // Render the core review content
  const reviewContent = (
    <div className={`h-full overflow-y-auto ${pageShellClassName} ${containerClassName}`}>
      <div className="mx-auto max-w-[1180px]">
        {/* ── Header ── */}
        {headerSlot ? (
          headerSlot
        ) : (
          <header className="mb-7">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mb-5 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] text-[#999] transition-colors hover:text-[#555]"
              >
                <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.75} />
                <span>{backLabel}</span>
              </button>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-[24px] font-medium leading-tight text-[#111]">{title}</h1>
                {subtitle && (
                  <p className="mt-1 max-w-[560px] text-[14px] leading-normal text-[#666]">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {headerChipsSlot}
                {headerActionsSlot}
              </div>
            </div>
          </header>
        )}

        {/* ── Performance Overview ── */}
        {performanceSlot ? (
          performanceSlot
        ) : performance ? (
          <ReviewPerformanceCard performance={performance} />
        ) : null}

        {/* ── Two-Column Layout (Navigator + Question Review) ── */}
        <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-start">
          {/* Left Column: Navigator */}
          <ReviewQuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            selectedSubject={selectedSubject}
            onSelectSubject={(subj) => {
              setSelectedSubject(subj);
              setUserSelectedSubject(true);
            }}
            onJumpToQuestion={onJumpToQuestion}
          />

          {/* Right Column: Question Review Card */}
          <section className="min-w-0 flex-1">
            <h2 className={sectionLabelClassName}>Question review</h2>
            <div className={cardClassName}>
              {/* Question Header Meta */}
              <div className="flex flex-col gap-3 border-b-[0.5px] border-[#f0f0f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[#333]">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                  <p className="mt-1 text-[12px] text-[#aaa]">
                    {currentQuestion.isCorrect
                      ? "Answered correctly"
                      : currentQuestion.userAnswer !== undefined && currentQuestion.userAnswer !== null
                      ? "Needs revision"
                      : "Not attempted"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentQuestion.subject && (
                    <Badge
                      variant="outline"
                      className="rounded-[6px] border-[#e7e7e4] bg-[#fafafa] px-2.5 py-1 text-[12px] font-medium capitalize text-[#666]"
                    >
                      {currentQuestion.subject}
                    </Badge>
                  )}
                  {currentQuestion.examType && currentQuestion.examYear && (
                    <Badge
                      variant="outline"
                      className="rounded-[6px] border-[#e7e7e4] bg-[#fafafa] px-2.5 py-1 text-[12px] font-medium text-[#666]"
                    >
                      {currentQuestion.examType.toUpperCase()} {currentQuestion.examYear}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Question Body */}
              <div className="px-5 py-5">
                <QuestionReviewCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={questions.length}
                  onSave={onSaveQuestion ? () => onSaveQuestion(currentQuestion.id) : undefined}
                  saving={isSavingQuestion}
                  showSolution={showSolution}
                  onToggleSolution={onToggleSolution}
                  hideSaveButton={hideSaveButton || !onSaveQuestion}
                  hideSolutionButton={hideSolutionButton}
                />

                {/* Solution Expandable View */}
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

                {/* Bottom Navigation */}
                <div className="mt-6 flex items-center justify-between border-t-[0.5px] border-[#f0f0f0] pt-4">
                  <button
                    type="button"
                    onClick={onPrevQuestion}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border-[0.5px] border-[#e4e4e1] bg-white px-4 py-2 text-[13px] text-[#666] transition-colors hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-[13px] w-[13px]" strokeWidth={1.75} />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={onNextQuestion}
                    disabled={currentIndex === questions.length - 1}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border-0 px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ backgroundColor: orange }}
                  >
                    <span>Next</span>
                    <ArrowRight className="h-[13px] w-[13px]" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  // If no chat panel slot provided, render standalone view
  if (!chatPanelSlot) {
    return reviewContent;
  }

  // If chat panel slot is provided, wrap in ResizablePanelGroup
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
          {reviewContent}
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className={showChatPanel && !isMobileViewport ? "" : "pointer-events-none opacity-0"}
        />

        <ResizablePanel
          ref={chatPanelRef}
          defaultSize={0}
          collapsedSize={0}
          collapsible
          minSize={isMobileViewport || isChatFullscreen ? 100 : 22}
          maxSize={isMobileViewport || isChatFullscreen ? 100 : 45}
          onResize={(size) => {
            if (size > 0) setChatPanelSize(size);
          }}
          className="min-w-0"
        >
          {chatPanelSlot}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default TestReviewView;
