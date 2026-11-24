import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/core/ui/cn";
import type { ReviewQuestion } from "../../types/practiceTypes";
import { Rich, outcomeOf, secondaryButton, textLink } from "./reviewParts";

/**
 * The question's own explanation (the API's `solution`) under it, shown by default. Hiding
 * it holds for every question, and on this device, until it is shown again. The AI tutor is
 * one tap away for anything the explanation doesn't settle.
 */

const PREFERENCE_KEY = "fasiti-review-explanation";

const readShown = () => {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) !== "hidden";
  } catch {
    return true;
  }
};

const writeShown = (shown: boolean) => {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, shown ? "shown" : "hidden");
  } catch {
    // Storage blocked (private mode): the choice lasts for this visit
  }
};

export const useExplanationPreference = () => {
  const [shown, setShown] = useState(readShown);
  const toggle = () =>
    setShown((current) => {
      writeShown(!current);
      return !current;
    });
  return { shown, toggle };
};

interface ReviewExplanationProps {
  question: ReviewQuestion;
  shown: boolean;
  onToggle: () => void;
  onAskTutor: () => void;
}

const ReviewExplanation = ({ question, shown, onToggle, onAskTutor }: ReviewExplanationProps) => {
  const hasText = Boolean(question.solution?.trim());
  const missed = outcomeOf(question) !== "right";

  return (
    <section aria-labelledby="explanation-heading" className="mt-8 border-t pt-6">
      <div className="flex items-center justify-between gap-4">
        <h3 id="explanation-heading" className="text-xl font-extrabold tracking-[-0.02em]">
          Explanation
        </h3>
        {hasText && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={shown}
            aria-controls="explanation-body"
            className={cn(textLink, "text-muted-foreground")}
          >
            {shown ? "Hide explanation" : "Show explanation"}
          </button>
        )}
      </div>
      {hasText ? (
        <div id="explanation-body" hidden={!shown} className="mt-3 max-w-[68ch]">
          <Rich content={question.solution} className="text-[16px] leading-[1.75]" />
        </div>
      ) : (
        <p className="mt-2 text-muted-foreground">This question has no written explanation yet. The AI Tutor can explain it.</p>
      )}
      <button type="button" onClick={onAskTutor} className={secondaryButton("mt-6")}>
        <Sparkles className="h-4 w-4 text-brand-text" aria-hidden="true" />
        {missed ? "Ask the AI Tutor about my answer" : "Ask the AI Tutor"}
      </button>
    </section>
  );
};

export default ReviewExplanation;
