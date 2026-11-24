import { Check, Minus, X } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE, PRIMARY_ACTION, SECONDARY_ACTION } from "@/core/ui/styles";
import MathContent from "../MathContent";
import type { ReviewQuestion } from "../../types/practiceTypes";

/** Shared pieces of the test review (design approved 2026-11-24; MASTER.md tokens only). */

export type Outcome = "right" | "wrong" | "skipped";

export const outcomeOf = (question: ReviewQuestion): Outcome =>
  question.userAnswer === undefined || question.userAnswer === null ? "skipped" : question.isCorrect ? "right" : "wrong";

export const OUTCOME_WORD: Record<Outcome, string> = { right: "right", wrong: "wrong", skipped: "skipped" };

export const letterOf = (question: ReviewQuestion, index: number | undefined) =>
  index === undefined || index === null || index < 0 ? "" : question.optionAlphas?.[index] ?? String.fromCharCode(65 + index);

const BUTTON_BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50";

export const primaryButton = (extra?: string) => cn(BUTTON_BASE, PRESSABLE, PRIMARY_ACTION, FOCUS_RING, extra);
export const secondaryButton = (extra?: string) => cn(BUTTON_BASE, PRESSABLE, SECONDARY_ACTION, FOCUS_RING, extra);
export const quietButton = (extra?: string) =>
  cn(BUTTON_BASE, "px-3 text-muted-foreground hover:bg-muted hover:text-foreground", PRESSABLE, FOCUS_RING, extra);

export const textLink = cn(
  "inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-brand-text underline-offset-4 hover:underline",
  FOCUS_RING,
);

/** The mark for an outcome: a shape as well as a colour, so it reads without colour. */
export const OutcomeMark = ({ outcome, className }: { outcome: Outcome; className?: string }) => {
  if (outcome === "right") {
    return <Check className={cn("h-4 w-4 text-emerald-700 dark:text-emerald-400", className)} strokeWidth={3} aria-hidden="true" />;
  }
  if (outcome === "wrong") return <X className={cn("h-4 w-4 text-destructive", className)} strokeWidth={3} aria-hidden="true" />;
  return <Minus className={cn("h-4 w-4 text-muted-foreground", className)} strokeWidth={3} aria-hidden="true" />;
};

/** Question, option and explanation text, maths included, in the page's own colours. */
export const Rich = ({ content, inline, className }: { content?: string; inline?: boolean; className?: string }) => (
  <MathContent
    content={content}
    inline={inline}
    className={cn(
      "text-inherit [&_*]:text-inherit [&_p]:my-0 [&_p+p]:mt-3 [&_strong]:font-bold [&_.katex-display]:my-3 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden",
      className,
    )}
  />
);

/** Subjects arrive as the API stores them ("biology"); shown as names. */
export const subjectName = (subject?: string) => {
  const name = (subject ?? "").trim() || "General";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/** "00:14:32" (the API's time used) as "14 min 32 s". */
export const formatTimeUsed = (value: string | undefined) => {
  const parts = String(value ?? "").split(":").map(Number);
  if (parts.length === 0 || parts.some((part) => !Number.isFinite(part))) return null;
  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${rest} s`;
  return `${rest} s`;
};
