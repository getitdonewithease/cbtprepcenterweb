import { useRef, useState, type KeyboardEvent } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE } from "@/core/ui/styles";
import MathContent from "../MathContent";
import { hasPicture, isPassage } from "../../service/testScreenService";
import type { TestScreenQuestion } from "../../types/testScreenTypes";

/** The question itself: its instruction or passage, its picture, and the A to D choices. */

const Picture = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <p className={cn("flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground", className)}>
        <ImageOff className="h-4 w-4 shrink-0" aria-hidden="true" /> This picture didn't load. Answer from the text if you can.
      </p>
    );
  }
  return <img src={src} alt={alt} onError={() => setBroken(true)} className={cn("h-auto max-w-full rounded-xl border", className)} />;
};

export const Passage = ({ text }: { text: string }) => (
  <details open className="group">
    <summary className={cn("flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg font-bold lg:hidden [&::-webkit-details-marker]:hidden", FOCUS_RING)}>
      Read the passage
      <span className="text-sm font-semibold text-brand-text group-open:hidden">Show</span>
      <span className="hidden text-sm font-semibold text-brand-text group-open:inline">Hide</span>
    </summary>
    <div className="max-h-[50dvh] overflow-y-auto rounded-xl bg-muted/60 p-4 text-[15px] leading-7 lg:max-h-[calc(100dvh-13rem)] lg:p-6" tabIndex={0} aria-label="Passage">
      <MathContent content={text} className="whitespace-pre-line" />
    </div>
  </details>
);

interface ChoicesProps {
  question: TestScreenQuestion;
  selected?: string;
  disabled?: boolean;
  onSelect: (optionId: string) => void;
}

/** Letter rows (design approved 2026-11-24). A radio group: arrow keys move and choose, as native radios do. */
export const Choices = ({ question, selected, disabled, onSelect }: ChoicesProps) => {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusIndex = Math.max(0, question.options.findIndex((o) => o.id === selected));

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    e.stopPropagation();
    const next = (i + step + question.options.length) % question.options.length;
    refs.current[next]?.focus();
    if (!disabled) onSelect(question.options[next].id);
  };

  return (
    <div role="radiogroup" aria-labelledby="question-text" className="divide-y border-y">
      {question.options.map((o, i) => {
        const on = selected === o.id;
        return (
          <button
            key={o.id}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={on}
            aria-disabled={disabled || undefined}
            tabIndex={i === focusIndex ? 0 : -1}
            onClick={() => !disabled && onSelect(o.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "flex min-h-14 w-full items-center gap-4 px-2 py-3 text-left",
              on ? "bg-brand-orange/10" : !disabled && "[@media(hover:hover)]:hover:bg-muted/60",
              disabled && "cursor-not-allowed",
              PRESSABLE,
              FOCUS_RING,
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold",
                on ? "bg-primary text-primary-foreground" : "border border-muted-foreground/40 text-muted-foreground",
              )}
            >
              <span className="sr-only">Option </span>
              {o.label}
            </span>
            <span className="min-w-0 flex-1 text-[16px] leading-7">
              {o.content && <MathContent content={o.content} inline />}
              {hasPicture(o.imageUrl) && <Picture src={o.imageUrl ?? ""} alt={`Option ${o.label}`} className="mt-2 max-h-40 object-contain" />}
            </span>
          </button>
        );
      })}
    </div>
  );
};

interface QuestionViewProps {
  question: TestScreenQuestion;
  number: number;
  of: number;
  subject: string;
  headingRef: React.Ref<HTMLHeadingElement>;
  selected?: string;
  disabled?: boolean;
  onSelect: (optionId: string) => void;
}

const QuestionView = ({ question, number, of, subject, headingRef, selected, disabled, onSelect }: QuestionViewProps) => {
  const passage = isPassage(question.section);
  return (
    <div className={cn(passage && "lg:grid lg:grid-cols-2 lg:gap-10")}>
      {passage && (
        <div className="mb-6 lg:mb-0">
          <Passage text={question.section ?? ""} />
        </div>
      )}
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="flex flex-wrap items-baseline gap-x-3 text-sm text-muted-foreground outline-none">
          <span className="font-bold text-foreground">
            <span className="sr-only">{subject}, </span>Question {number} <span className="font-semibold text-muted-foreground">of {of}</span>
          </span>
          {question.tag && <span>{question.tag}</span>}
        </h1>
        {!passage && question.section && <MathContent content={question.section} className="mt-3 text-pretty text-[15px] text-muted-foreground" />}
        <div id="question-text">
          <MathContent content={question.content} className="mt-3 text-pretty text-xl font-semibold leading-8 sm:text-[22px] sm:leading-9" />
        </div>
        {hasPicture(question.imageUrl) && <Picture src={question.imageUrl ?? ""} alt={`Picture for question ${number}`} className="mt-4" />}
        <div className="mt-6">
          <Choices question={question} selected={selected} disabled={disabled} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
