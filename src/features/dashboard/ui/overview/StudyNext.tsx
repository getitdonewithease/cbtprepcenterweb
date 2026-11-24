import type { MouseEvent } from "react";
import { Sparkles } from "lucide-react";
import type { StudyFocus } from "../../service/dashboardSummaryService";
import { SECTION, SectionHeading, Skeleton, secondaryButton, textLink } from "./sheetParts";

/**
 * One thing to study next: the weakest topic when topic data exists, otherwise a subject
 * never practised, otherwise the lowest subject. One button, one quieter alternative.
 */

interface StudyNextProps {
  focus: StudyFocus;
  isLoading: boolean;
  onPractise: (event: MouseEvent<HTMLButtonElement>) => void;
  onAskTutor: (subject: string, topic?: string) => void;
}

const copy = (focus: Exclude<StudyFocus, { kind: "none" }>) => {
  switch (focus.kind) {
    case "topic":
      return {
        title: focus.topic,
        reason: `${focus.subject}: your answers show this topic needs the most work.`,
        practise: `Practise ${focus.subject}`,
      };
    case "unpractised":
      return {
        title: focus.subject,
        reason: "You haven't practised this subject yet. One short test shows where you stand.",
        practise: `Practise ${focus.subject}`,
      };
    case "subject":
      return {
        title: focus.subject,
        reason: `Your lowest subject so far, at ${focus.mark}% in practice.`,
        practise: `Practise ${focus.subject}`,
      };
  }
};

const StudyNext = ({ focus, isLoading, onPractise, onAskTutor }: StudyNextProps) => (
  <section aria-labelledby="next-heading" className={SECTION}>
    <SectionHeading id="next-heading">Study next</SectionHeading>
    {isLoading ? (
      <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading what to study next">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    ) : focus.kind === "none" ? (
      <p className="mt-3 text-pretty text-muted-foreground">
        After your first test, this names the one subject or topic costing you the most marks, with
        practice and the AI tutor ready for it.
      </p>
    ) : (
      (() => {
        const { title, reason, practise } = copy(focus);
        return (
          <>
            <p className="mt-4 text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em]">{title}</p>
            <p className="mt-1 text-pretty text-muted-foreground">{reason}</p>
            <div className="mt-5 flex flex-col items-start gap-1">
              <button type="button" onClick={onPractise} className={secondaryButton("w-full sm:w-auto")}>
                {practise}
              </button>
              <button
                type="button"
                onClick={() => onAskTutor(focus.subject, focus.kind === "topic" ? focus.topic : undefined)}
                className={textLink}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Or have the AI tutor teach it first
              </button>
            </div>
          </>
        );
      })()
    )}
  </section>
);

export default StudyNext;
