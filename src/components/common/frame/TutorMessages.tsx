import { useEffect, useState } from "react";
import { ArrowRight, Check, Copy, RotateCw } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE } from "@/core/ui/styles";
import { ChatMarkdownContent, TutorThinking, type ChatQuizSelectedAnswers, type ChatQuizSubmission } from "@/features/chat";
import type { TutorSuggestion } from "@/features/dashboard";

/**
 * The AI tutor's messages and first screen for the app frame (design: empty state A,
 * conversation C). Your message is a small tinted bubble; the tutor's answer sits open on
 * the panel with a quiet Copy under it. A failed or stopped answer says so and offers
 * Try again instead of pretending to be a reply.
 */

const ROW = cn("group flex min-h-14 w-full items-center gap-3 py-3 text-left", FOCUS_RING);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => undefined);
      }}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
        PRESSABLE,
        FOCUS_RING,
      )}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

export const UserMessage = ({ content }: { content: string }) => (
  <div className="flex justify-end">
    <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-[15px]">{content}</p>
  </div>
);

interface TutorAnswerProps {
  content: string;
  isStreaming: boolean;
  quizKey: string;
  submittedAnswers: ChatQuizSelectedAnswers | null;
  onSubmitQuiz: (submission: ChatQuizSubmission) => void;
}

export const TutorAnswer = ({ content, isStreaming, quizKey, submittedAnswers, onSubmitQuiz }: TutorAnswerProps) => (
  // min-w-0: a collapsed quiz's one-line preview must never set the column's width
  <article aria-label="AI Tutor's answer" className="min-w-0">
    <ChatMarkdownContent
      content={content}
      quizKey={quizKey}
      initialSubmittedAnswers={submittedAnswers}
      onSubmitQuiz={onSubmitQuiz}
      isStreaming={isStreaming}
    />
    {!isStreaming && (
      <div className="-ml-3 mt-1">
        <CopyButton text={content} />
      </div>
    )}
  </article>
);

/** An answer that never arrived (stopped, interrupted) or a send that failed. */
export const TutorNoAnswer = ({ isError, onRetry }: { isError: boolean; onRetry?: () => void }) => (
  <div role={isError ? "alert" : undefined} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
    <span className={isError ? "font-semibold text-destructive" : "text-muted-foreground"}>
      {isError ? "The tutor couldn't answer. Check your connection." : "No answer to this message."}
    </span>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 font-semibold text-brand-text hover:bg-brand-orange/10", FOCUS_RING)}
      >
        <RotateCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    )}
  </div>
);

export { TutorThinking };

export const TutorEmptyState = ({
  firstName,
  suggestions,
  onPick,
}: {
  firstName?: string;
  suggestions: TutorSuggestion[];
  onPick: (suggestion: TutorSuggestion) => void;
}) => (
  <div className="px-5 pb-4 pt-8 sm:px-6">
    <p className="text-2xl font-extrabold tracking-[-0.02em]">{firstName ? `Hi ${firstName}.` : "Hi."}</p>
    <p className="mt-2 text-pretty text-muted-foreground">
      I know your four subjects and how your tests went. Start with one of these, or ask anything.
    </p>
    <ul className="mt-6 border-t">
      {suggestions.map((s) => (
        <li key={s.id} className="border-b">
          <button type="button" onClick={() => onPick(s)} className={ROW}>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold group-hover:text-brand-text">{s.label}</span>
              <span className="block text-sm text-muted-foreground">{s.reason}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-brand-text transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export const FOLLOW_UPS = [
  { label: "Show me a worked example", prompt: "Show me a worked example of this, step by step." },
  { label: "Quiz me on this", prompt: "Quiz me on this with 3 UTME-style questions." },
  { label: "Explain it more simply", prompt: "Explain that again more simply, with an everyday example." },
];

/** After the latest answer: always a next step. */
export const WhereNext = ({ onAsk }: { onAsk: (prompt: string) => void }) => (
  <section aria-labelledby="where-next" className="pt-2">
    <h3 id="where-next" className="text-base font-bold">
      Where next?
    </h3>
    <ul className="mt-1 border-b">
      {FOLLOW_UPS.map((f) => (
        <li key={f.label} className="border-t first:border-t-0">
          <button type="button" onClick={() => onAsk(f.prompt)} className={ROW}>
            <span className="min-w-0 flex-1 font-semibold group-hover:text-brand-text">{f.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-brand-text transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  </section>
);
