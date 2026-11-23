import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, X } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION } from "@/core/ui/styles";
import { useChatQuizState } from "../hooks/useChatQuizState";
import type {
  ChatQuizQuestion,
  ChatQuizSelectedAnswers,
  ChatQuizSubmission,
} from "../types/chatQuizTypes";

/**
 * The practice quiz inside a tutor answer: the one card a conversation needs (an
 * interactive unit inside prose). Flat inside: no boxed header or footer band, no
 * uppercase labels, tokens only, 44px targets. Right and wrong are marked with text and
 * an icon, never colour alone.
 */

const quizRemarkPlugins = [remarkGfm, remarkMath];
const quizRehypePlugins = [rehypeKatex];

const CARD = "my-4 w-full max-w-2xl min-w-0 rounded-2xl border bg-card p-4 text-card-foreground sm:p-5";
const ICON_BUTTON = cn(
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
  PRESSABLE,
  FOCUS_RING,
);

export const ChatQuizLoadingCard: React.FC = () => (
  <div className={CARD} aria-busy="true" aria-label="Writing a practice question">
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 text-brand-text motion-safe:animate-spin" aria-hidden="true" />
      Writing a practice question…
    </p>
    <div className="mt-3 space-y-2">
      <div className="h-4 w-3/4 rounded-md bg-muted motion-safe:animate-pulse" />
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex items-center gap-3 px-3 py-2">
          <div className="h-7 w-7 shrink-0 rounded-lg bg-muted motion-safe:animate-pulse" />
          <div className="h-3.5 w-1/2 rounded bg-muted motion-safe:animate-pulse" />
        </div>
      ))}
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

const stripMath = (text: string) => text.replace(/\$+/g, "");

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
  const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isQuiz = totalQuestions > 1;

  return (
    <section aria-label={isQuiz ? "Practice quiz" : "Practice question"} className={CARD}>
      {/* Header: where you are, progress, and the collapse control */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!isCollapsed}
          className={cn("min-w-0 flex-1 rounded-lg py-1 text-left", FOCUS_RING)}
        >
          <span className="block text-sm text-muted-foreground">
            {isCollapsed ? (
              isQuiz ? `Practice quiz, ${totalQuestions} questions` : "Practice question"
            ) : isQuiz ? (
              <>
                Practice question <span className="font-semibold text-foreground">{currentStep + 1}</span> of {totalQuestions}
              </>
            ) : (
              "Practice question"
            )}
            {isCollapsed && allQuestionsAnswered && hasAnswerKeys ? (
              <span className="font-semibold text-foreground">
                {" "}· Score {score} of {totalQuestions}
              </span>
            ) : null}
          </span>
          {isCollapsed && currentQuestion.question ? (
            <span className="mt-0.5 block truncate text-sm font-semibold">{stripMath(currentQuestion.question)}</span>
          ) : null}
        </button>

        {isQuiz && !isCollapsed ? (
          <span className="flex shrink-0 items-center">
            <button type="button" disabled={!canGoPrevious} onClick={goToPrevious} aria-label="Previous question" className={ICON_BUTTON}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" disabled={!canGoNext} onClick={goToNext} aria-label="Next question" className={ICON_BUTTON}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </span>
        ) : null}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand the question" : "Collapse the question"}
          className={ICON_BUTTON}
        >
          {isCollapsed ? <ChevronDown className="h-5 w-5" aria-hidden="true" /> : <ChevronUp className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Progress: one quiet dot per question, filled once answered */}
      {isQuiz && !isCollapsed ? (
        <ol className="mt-1 flex gap-1.5" aria-label={`${answeredCount} of ${totalQuestions} answered`}>
          {questions.map((q, idx) => {
            const chosen = selectedAnswers[q.index];
            const answered = chosen !== undefined;
            const right = answered && q.answer !== null && chosen === q.answer;
            const wrong = answered && q.answer !== null && chosen !== q.answer;
            return (
              <li
                key={q.index}
                aria-hidden="true"
                className={cn(
                  "h-1.5 flex-1 rounded-full bg-muted",
                  answered && q.answer === null && "bg-brand-orange",
                  right && "bg-emerald-700",
                  wrong && "bg-destructive",
                  idx === currentStep && !answered && "bg-foreground/30",
                )}
              />
            );
          })}
        </ol>
      ) : null}

      {!isCollapsed ? (
        <>
          {currentQuestion.question ? (
            <div className="mt-4 text-pretty font-semibold leading-snug [&_p]:m-0">
              <ReactMarkdown remarkPlugins={quizRemarkPlugins} rehypePlugins={quizRehypePlugins}>
                {currentQuestion.question}
              </ReactMarkdown>
            </div>
          ) : null}

          <ul className="mt-3 space-y-1">
            {currentQuestion.options.map((option) => {
              const isSelected = chosenForCurrent === option.key;
              const isCorrectOption = currentQuestion.answer === option.key;
              const pickedNoKey = isCurrentAnswered && !currentHasAnswerKey && isSelected;
              const correctChoice = isCurrentAnswered && currentHasAnswerKey && isSelected && isCorrectOption;
              const wrongChoice = isCurrentAnswered && currentHasAnswerKey && isSelected && !isCorrectOption;
              const missedCorrect = isCurrentAnswered && currentHasAnswerKey && !isSelected && isCorrectOption;
              const dimmed = isCurrentAnswered && currentHasAnswerKey && !isSelected && !isCorrectOption;
              const interactive = !isSubmitted && (!currentHasAnswerKey || !isCurrentAnswered);

              return (
                <li key={option.key}>
                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={() => selectOption(currentQuestion.index, option.key)}
                    className={cn(
                      "flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm disabled:cursor-default",
                      interactive && "hover:bg-muted",
                      pickedNoKey && "bg-brand-orange/10",
                      correctChoice && "bg-emerald-700/10",
                      wrongChoice && "bg-destructive/10",
                      dimmed && "opacity-60",
                      FOCUS_RING,
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
                        pickedNoKey && "border-primary bg-primary text-primary-foreground",
                        correctChoice && "border-emerald-700 bg-emerald-700 text-white",
                        wrongChoice && "border-destructive bg-destructive text-destructive-foreground",
                        missedCorrect && "border-emerald-700 text-emerald-700",
                      )}
                    >
                      {correctChoice ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : wrongChoice ? (
                        <X className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        option.key
                      )}
                    </span>
                    <span className="min-w-0 flex-1 pt-1 leading-relaxed [&_p]:m-0">
                      <ReactMarkdown remarkPlugins={quizRemarkPlugins} rehypePlugins={quizRehypePlugins}>
                        {option.text}
                      </ReactMarkdown>
                    </span>
                    {correctChoice && <span className="shrink-0 pt-1 text-xs font-semibold text-emerald-700">Correct</span>}
                    {wrongChoice && <span className="shrink-0 pt-1 text-xs font-semibold text-destructive">Your answer</span>}
                    {missedCorrect && <span className="shrink-0 pt-1 text-xs font-semibold text-emerald-700">Right answer</span>}
                    {pickedNoKey && <span className="shrink-0 pt-1 text-xs font-semibold text-brand-text">Your answer</span>}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            {allQuestionsAnswered ? (
              <>
                <p className="text-sm font-semibold">
                  {hasAnswerKeys
                    ? `Score ${score} of ${totalQuestions} (${scorePercentage}%)`
                    : isQuiz
                      ? `All ${totalQuestions} answered`
                      : `You chose ${chosenForCurrent}`}
                </p>
                {isSubmitted ? (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                    Sent to the tutor
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={submitQuiz}
                    className={cn("inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold", PRESSABLE, PRIMARY_ACTION, FOCUS_RING)}
                  >
                    Send my answers to the tutor
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {isQuiz ? `${answeredCount} of ${totalQuestions} answered` : "Pick an answer"}
                </p>
                {isCurrentAnswered && canGoNext ? (
                  <button
                    type="button"
                    onClick={goToNext}
                    className={cn("inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-brand-text hover:bg-brand-orange/10", FOCUS_RING)}
                  >
                    Next question
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
};
