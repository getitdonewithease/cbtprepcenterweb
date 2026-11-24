import { useState, type ReactNode } from "react";
import { Bookmark, BookmarkCheck, ImageOff } from "lucide-react";
import { cn } from "@/core/ui/cn";
import type { ReviewQuestion } from "../../types/practiceTypes";
import { OutcomeMark, Rich, letterOf, outcomeOf, quietButton, subjectName, type Outcome } from "./reviewParts";

/**
 * One question under review, as an answer sheet: every option a plain row; your pick and
 * the answer named in words on their rows, not only coloured. The explanation follows.
 */

interface ReviewQuestionSheetProps {
  question: ReviewQuestion;
  number: number;
  total: number;
  explanation: ReactNode;
  saveState: "idle" | "saving" | "saved";
  /** Absent where questions can't be saved. */
  onSave?: () => void;
}

const isUsableUrl = (url?: string | null): url is string =>
  typeof url === "string" && url.trim().length > 0 && !["null", "undefined"].includes(url.trim().toLowerCase());

/** A picture that may fail to load says so in words instead of showing a broken image. */
const QuestionPicture = ({ src, alt, className }: { src?: string | null; alt: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (!isUsableUrl(src)) return null;
  if (failed) {
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <ImageOff className="h-4 w-4 shrink-0" aria-hidden="true" />
        This picture didn't load.
      </p>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={cn("mt-3 max-w-full rounded-lg", className)} />;
};

type RowRole = "yours-wrong" | "yours-right" | "answer" | "other";

const roleOf = (question: ReviewQuestion, index: number): RowRole => {
  const isAnswer = index === question.correctAnswer;
  const isYours = index === question.userAnswer;
  if (isYours && isAnswer) return "yours-right";
  if (isYours) return "yours-wrong";
  if (isAnswer) return "answer";
  return "other";
};

const ROW_LABEL: Record<RowRole, string | null> = {
  "yours-right": "Your answer, correct",
  "yours-wrong": "Your answer",
  answer: "Correct answer",
  other: null,
};

const OptionRow = ({ question, index, number }: { question: ReviewQuestion; index: number; number: number }) => {
  const role = roleOf(question, index);
  const label = ROW_LABEL[role];
  const isAnswer = role === "answer" || role === "yours-right";
  const letter = letterOf(question, index);
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl px-3 py-3",
        isAnswer && "bg-emerald-600/[0.08] dark:bg-emerald-400/10",
        role === "yours-wrong" && "bg-destructive/[0.07]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
          isAnswer && "border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300",
          role === "yours-wrong" && "border-destructive text-destructive",
          role === "other" && "border-border text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {letter}
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="sr-only">Option {letter}: </span>
        <Rich content={question.options[index]} inline className="text-[15px] leading-7" />
        <QuestionPicture src={question.optionImages?.[index]} alt={`Picture for option ${letter} of question ${number}`} className="max-h-48" />
      </span>
      {label && (
        <span className={cn("flex shrink-0 items-center gap-1 pt-1 text-xs font-bold", isAnswer ? "text-emerald-800 dark:text-emerald-300" : "text-destructive")}>
          <OutcomeMark outcome={isAnswer ? "right" : "wrong"} className="h-3.5 w-3.5" />
          {label}
        </span>
      )}
    </li>
  );
};

const VERDICT: Record<Outcome, string> = { right: "You got this right", wrong: "You got this wrong", skipped: "You skipped this" };

const ReviewQuestionSheet = ({ question, number, total, explanation, saveState, onSave }: ReviewQuestionSheetProps) => {
  const outcome = outcomeOf(question);
  const saved = saveState === "saved";
  return (
    <article aria-labelledby="question-heading">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Question {number} of {total} · {subjectName(question.subject)}
          {question.examType && question.examYear ? ` · ${question.examType.toUpperCase()} ${question.examYear}` : ""}
        </p>
        {onSave && (
          <button type="button" onClick={onSave} disabled={saveState !== "idle"} className={quietButton("-mr-3 disabled:opacity-100")}>
            {saved ? <BookmarkCheck className="h-4 w-4 text-brand-text" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
            <span className="sr-only sm:not-sr-only">{saved ? "Saved" : saveState === "saving" ? "Saving…" : "Save question"}</span>
          </button>
        )}
      </div>
      <h2 id="question-heading" className="sr-only">
        Question {number}
      </h2>
      <p
        className={cn(
          "flex items-center gap-1.5 text-sm font-bold",
          outcome === "right" ? "text-emerald-800 dark:text-emerald-300" : outcome === "wrong" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <OutcomeMark outcome={outcome} className="h-3.5 w-3.5" />
        {VERDICT[outcome]}
      </p>
      {question.section && <Rich content={question.section} className="mt-3 max-w-[68ch] text-[15px] leading-7 text-muted-foreground" />}
      <Rich content={question.text} className="mt-3 text-pretty text-lg font-semibold leading-8" />
      <QuestionPicture src={question.imageUrl} alt={`Diagram for question ${number}`} className="max-h-80" />
      <ol className="mt-5 space-y-1" aria-label="Options">
        {question.options.map((_, index) => (
          <OptionRow key={index} question={question} index={index} number={number} />
        ))}
      </ol>
      {explanation}
    </article>
  );
};

export default ReviewQuestionSheet;
