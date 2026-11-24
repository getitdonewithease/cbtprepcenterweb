import { cn } from "@/core/ui/cn";
import type { ReviewQuestion } from "../../types/practiceTypes";
import { outcomeOf, subjectName, textLink } from "./reviewParts";

/** How the test went, in one line under the title; the review itself is the page. */

interface ReviewResultProps {
  questions: ReviewQuestion[];
  /** Above the count, e.g. "Time used: 7 s". */
  detail?: string;
  onShowMissed: () => void;
}

const bySubject = (questions: ReviewQuestion[]) => {
  const map = new Map<string, { right: number; total: number }>();
  for (const question of questions) {
    const subject = subjectName(question.subject);
    const entry = map.get(subject) ?? { right: 0, total: 0 };
    entry.total += 1;
    if (outcomeOf(question) === "right") entry.right += 1;
    map.set(subject, entry);
  }
  return [...map.entries()];
};

const ReviewResult = ({ questions, detail, onShowMissed }: ReviewResultProps) => {
  const right = questions.filter((q) => outcomeOf(q) === "right").length;
  const skipped = questions.filter((q) => outcomeOf(q) === "skipped").length;
  const missed = questions.length - right;

  return (
    <section aria-labelledby="result-heading" className="border-b pb-6">
      {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
      <h2 id="result-heading" className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">
        {right} of {questions.length} right
      </h2>
      <p className="mt-1 text-pretty text-muted-foreground">
        {bySubject(questions)
          .map(([subject, s]) => `${subject} ${s.right} of ${s.total}`)
          .join(" · ")}
        {skipped > 0 ? ` · ${skipped} skipped` : ""}
      </p>
      {missed > 0 && (
        <button type="button" onClick={onShowMissed} className={cn(textLink, "mt-2")}>
          Go through the {missed} you missed
        </button>
      )}
    </section>
  );
};

export default ReviewResult;
