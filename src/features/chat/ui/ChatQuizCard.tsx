import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  HelpCircle,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/ui/cn";
import { useChatQuizState } from "../hooks/useChatQuizState";
import type {
  ChatQuizQuestion,
  ChatQuizSelectedAnswers,
  ChatQuizSubmission,
} from "../types/chatQuizTypes";

const quizRemarkPlugins = [remarkGfm, remarkMath];
const quizRehypePlugins = [rehypeKatex];
const brandOrange = "hsl(var(--brand-orange))";

export const ChatQuizLoadingCard: React.FC = () => (
  <div className="my-3 w-full max-w-2xl overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
    <div className="flex items-center gap-2.5 border-b bg-muted/30 px-4 py-3">
      <div
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
      >
        <Loader2
          className="h-4 w-4 animate-spin"
          style={{ color: brandOrange }}
        />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
        Question generating…
      </span>
    </div>

    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted/70" />
      <div className="space-y-2 pt-1">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
          >
            <div className="h-6 w-6 shrink-0 animate-pulse rounded-lg bg-muted" />
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted/70" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export interface ChatQuizCardProps {
  questions: ChatQuizQuestion[];
  quizKey?: string;
  defaultCollapsed?: boolean;
  initialSubmittedAnswers?: ChatQuizSelectedAnswers | null;
  onSubmitQuiz?: (submission: ChatQuizSubmission) => void;
}

export const ChatQuizCard: React.FC<ChatQuizCardProps> = ({
  questions,
  quizKey,
  defaultCollapsed = false,
  initialSubmittedAnswers,
  onSubmitQuiz,
}) => {
  const {
    currentStep,
    currentQuestion,
    selectedAnswers,
    isSubmitted,
    isCollapsed,
    answeredCount,
    allQuestionsAnswered,
    hasAnswerKeys,
    score,
    totalQuestions,
    canGoPrevious,
    canGoNext,
    selectOption,
    goToStep,
    goToPrevious,
    goToNext,
    toggleCollapsed,
    submitQuiz,
  } = useChatQuizState({
    questions,
    quizKey,
    defaultCollapsed,
    initialSubmittedAnswers,
    onSubmitQuiz,
  });

  if (!currentQuestion) {
    return null;
  }

  const chosenForCurrent = selectedAnswers[currentQuestion.index];
  const isCurrentAnswered = chosenForCurrent !== undefined;
  const currentHasAnswerKey = currentQuestion.answer !== null;
  const scorePercentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="my-3 w-full max-w-2xl overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      {/* Header: Stepper Counter, Summary & Collapse Toggle */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 bg-muted/30 px-4 py-2.5",
          !isCollapsed && "border-b",
        )}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          aria-expanded={!isCollapsed}
        >
          <div
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
          >
            {allQuestionsAnswered ? (
              <CheckCircle2 className="h-4 w-4" style={{ color: brandOrange }} />
            ) : (
              <HelpCircle className="h-4 w-4" style={{ color: brandOrange }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {isCollapsed
                  ? totalQuestions > 1
                    ? `Practice Quiz (${totalQuestions} Questions)`
                    : "Quick Check"
                  : totalQuestions > 1
                    ? `Question ${currentStep + 1} of ${totalQuestions}`
                    : "Quick Check"}
              </span>
              {isCollapsed && allQuestionsAnswered && hasAnswerKeys ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    scorePercentage >= 50
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                  )}
                >
                  {score}/{totalQuestions} ({scorePercentage}%)
                </span>
              ) : null}
            </div>
            {isCollapsed && currentQuestion.question ? (
              <p className="truncate text-xs text-muted-foreground">
                {currentQuestion.question.replace(/\$+/g, "")}
              </p>
            ) : null}
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          {totalQuestions > 1 ? (
            <div className="flex items-center gap-1">
              {questions.map((q, idx) => {
                const chosen = selectedAnswers[q.index];
                const isAnswered = chosen !== undefined;
                const hasKey = q.answer !== null;
                const isCorrect = Boolean(isAnswered && hasKey && chosen === q.answer);
                const isActive = !isCollapsed && idx === currentStep;

                return (
                  <button
                    key={q.index}
                    type="button"
                    onClick={() => goToStep(idx)}
                    aria-label={`Go to question ${idx + 1}`}
                    className={cn(
                      "flex h-6 min-w-[24px] items-center justify-center rounded-md border px-1.5 text-xs font-semibold transition-all",
                      !isAnswered &&
                        !isActive &&
                        "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                      !isAnswered &&
                        isActive &&
                        "bg-background text-foreground shadow-sm",
                      isAnswered &&
                        !hasKey &&
                        "border-[hsl(var(--brand-orange)/0.5)] bg-[hsl(25_95%_53%/0.15)] text-[hsl(var(--brand-orange))]",
                      isAnswered &&
                        hasKey &&
                        isCorrect &&
                        "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                      isAnswered &&
                        hasKey &&
                        !isCorrect &&
                        "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300",
                    )}
                    style={
                      !isAnswered && isActive
                        ? { borderColor: brandOrange, color: brandOrange }
                        : undefined
                    }
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          ) : null}

          {!isCollapsed && totalQuestions > 1 ? (
            <div className="ml-1 flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={!canGoPrevious}
                onClick={goToPrevious}
                aria-label="Previous question"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={!canGoNext}
                onClick={goToNext}
                aria-label="Next question"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand question card" : "Collapse question card"}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            {isCollapsed ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Body & Footer */}
      {!isCollapsed ? (
        <>
          <div className="space-y-3.5 p-4">
            {currentQuestion.question ? (
              <div className="text-sm font-medium leading-relaxed text-foreground sm:text-base [&_p]:m-0">
                <ReactMarkdown
                  remarkPlugins={quizRemarkPlugins}
                  rehypePlugins={quizRehypePlugins}
                >
                  {currentQuestion.question}
                </ReactMarkdown>
              </div>
            ) : null}

            <div className="space-y-2">
              {currentQuestion.options.map((option) => {
                const isSelected = chosenForCurrent === option.key;
                const isCorrectOption = currentQuestion.answer === option.key;

                const showAsOrangeSelected =
                  isCurrentAnswered && !currentHasAnswerKey && isSelected;
                const showAsCorrectChoice =
                  isCurrentAnswered && currentHasAnswerKey && isSelected && isCorrectOption;
                const showAsWrongChoice =
                  isCurrentAnswered && currentHasAnswerKey && isSelected && !isCorrectOption;
                const showAsMissedCorrect =
                  isCurrentAnswered && currentHasAnswerKey && !isSelected && isCorrectOption;
                const showAsDimmed =
                  isCurrentAnswered &&
                  currentHasAnswerKey &&
                  !isSelected &&
                  !isCorrectOption;

                const isOptionInteractive =
                  !isSubmitted && (!currentHasAnswerKey || !isCurrentAnswered);

                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={!isOptionInteractive}
                    onClick={() => selectOption(currentQuestion.index, option.key)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                      isOptionInteractive &&
                        !showAsOrangeSelected &&
                        "cursor-pointer border-border bg-background hover:border-[hsl(var(--brand-orange)/0.5)] hover:bg-[hsl(25_95%_53%/0.05)]",
                      showAsOrangeSelected &&
                        "cursor-pointer border-[hsl(var(--brand-orange))] bg-[hsl(25_95%_53%/0.12)] text-foreground",
                      showAsCorrectChoice &&
                        "border-emerald-500/60 bg-emerald-500/10 text-foreground",
                      showAsWrongChoice &&
                        "border-rose-500/60 bg-rose-500/10 text-foreground",
                      showAsMissedCorrect &&
                        "border-emerald-500/45 bg-emerald-500/5 text-foreground",
                      showAsDimmed && "border-border/50 bg-muted/20 opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors",
                        isOptionInteractive &&
                          !showAsOrangeSelected &&
                          "border-border bg-muted/50 text-muted-foreground group-hover:border-[hsl(var(--brand-orange)/0.4)] group-hover:bg-[hsl(25_95%_53%/0.12)] group-hover:text-[hsl(var(--brand-orange))]",
                        showAsOrangeSelected &&
                          "border-[hsl(var(--brand-orange))] bg-[hsl(var(--brand-orange))] text-white",
                        showAsCorrectChoice &&
                          "border-emerald-500 bg-emerald-500 text-white",
                        showAsWrongChoice && "border-rose-500 bg-rose-500 text-white",
                        showAsMissedCorrect &&
                          "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                        showAsDimmed && "border-border/50 bg-muted text-muted-foreground",
                      )}
                    >
                      {option.key}
                    </span>

                    <div className="min-w-0 flex-1 leading-relaxed [&_p]:m-0">
                      <ReactMarkdown
                        remarkPlugins={quizRemarkPlugins}
                        rehypePlugins={quizRehypePlugins}
                      >
                        {option.text}
                      </ReactMarkdown>
                    </div>

                    {showAsOrangeSelected ? (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: "hsl(25 95% 53% / 0.15)",
                          color: brandOrange,
                        }}
                      >
                        Selected
                      </span>
                    ) : null}

                    {showAsCorrectChoice ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Correct
                      </span>
                    ) : null}

                    {showAsWrongChoice ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                        <XCircle className="h-3.5 w-3.5" />
                        Incorrect
                      </span>
                    ) : null}

                    {showAsMissedCorrect ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Answer
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-2.5">
            {allQuestionsAnswered ? (
              <>
                <div className="flex items-center gap-2">
                  {hasAnswerKeys ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        scorePercentage >= 50
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      Score: {score}/{totalQuestions} ({scorePercentage}%)
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      {totalQuestions > 1
                        ? `All ${totalQuestions} questions answered`
                        : `Option ${chosenForCurrent} selected`}
                    </span>
                  )}
                </div>

                {isSubmitted ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Submitted to AI Tutor
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={submitQuiz}
                    className="h-8 gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                    style={{ backgroundColor: brandOrange }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit to AI Tutor
                  </Button>
                )}
              </>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">
                  {totalQuestions > 1
                    ? `${answeredCount} of ${totalQuestions} answered`
                    : "Click an option above to answer"}
                </span>

                {isCurrentAnswered && canGoNext ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goToNext}
                    className="h-7 gap-1 rounded-lg px-2.5 text-xs font-medium"
                  >
                    Next Question
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
