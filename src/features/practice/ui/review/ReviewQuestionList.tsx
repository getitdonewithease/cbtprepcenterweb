import { useEffect, useRef } from "react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING } from "@/core/ui/styles";
import type { ReviewQuestion } from "../../types/practiceTypes";
import { OUTCOME_WORD, OutcomeMark, outcomeOf, subjectName } from "./reviewParts";

/**
 * Every question, to jump to: numbers that stay numbers, with a mark under each, grouped by
 * subject. A column on desktop; on phones one slim strip that scrolls sideways, with the
 * Missed filter at its end. Each button names its result, and the current one is marked.
 */

export type ListFilter = "all" | "missed";

interface ReviewQuestionListProps {
  questions: ReviewQuestion[];
  currentIndex: number;
  filter: ListFilter;
  onFilterChange: (filter: ListFilter) => void;
  onJump: (index: number) => void;
}

const groupBySubject = (questions: ReviewQuestion[], filter: ListFilter) => {
  const map = new Map<string, Array<{ question: ReviewQuestion; index: number }>>();
  questions.forEach((question, index) => {
    if (filter === "missed" && outcomeOf(question) === "right") return;
    const subject = subjectName(question.subject);
    const list = map.get(subject) ?? [];
    list.push({ question, index });
    map.set(subject, list);
  });
  return [...map.entries()];
};

const ReviewQuestionList = ({ questions, currentIndex, filter, onFilterChange, onJump }: ReviewQuestionListProps) => {
  const missed = questions.filter((q) => outcomeOf(q) !== "right").length;
  const currentRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // On a phone the strip scrolls sideways: keep the current number in view, sideways only,
  // so the page itself never jumps
  useEffect(() => {
    const strip = stripRef.current;
    const current = currentRef.current;
    if (!strip || !current || strip.scrollWidth <= strip.clientWidth) return;
    const left = current.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
    strip.scrollTo({ left: left - strip.clientWidth / 2 + current.offsetWidth / 2 });
  }, [currentIndex, filter]);

  const groups = groupBySubject(questions, filter);

  return (
    <nav aria-label="Questions" className="min-w-0">
      <div className="hidden flex-wrap items-center justify-between gap-3 lg:flex">
        <h2 className="text-xl font-extrabold tracking-[-0.02em]">Questions</h2>
        <div role="group" aria-label="Show" className="inline-flex rounded-xl bg-muted p-1 text-sm font-semibold">
          {(["all", "missed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => onFilterChange(f)}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg px-3",
                filter === f ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                FOCUS_RING,
              )}
            >
              {f === "all" ? "All" : `Missed (${missed})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2 lg:block">
        <div ref={stripRef} className="-ml-2 min-w-0 flex-1 overflow-x-auto pl-2 lg:ml-0 lg:mt-5 lg:overflow-visible lg:pl-0">
          {groups.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">You got every question right.</p>
          ) : (
            <div className="flex gap-6 lg:block lg:space-y-6">
              {groups.map(([subject, items]) => (
                <section key={subject} aria-label={subject} className="shrink-0">
                  <h3 className="text-xs font-semibold text-muted-foreground lg:text-sm">{subject}</h3>
                  <ol className="mt-1 flex gap-1 lg:mt-2 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] lg:gap-1.5">
                    {items.map(({ question, index }) => {
                      const isCurrent = index === currentIndex;
                      const outcome = outcomeOf(question);
                      return (
                        <li key={question.id}>
                          <button
                            ref={isCurrent ? currentRef : undefined}
                            type="button"
                            onClick={() => onJump(index)}
                            aria-current={isCurrent ? "true" : undefined}
                            aria-label={`Question ${index + 1}, ${OUTCOME_WORD[outcome]}`}
                            className={cn(
                              "flex h-14 w-11 flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-bold tabular-nums lg:w-full",
                              isCurrent ? "bg-foreground text-background" : "hover:bg-muted",
                              FOCUS_RING,
                            )}
                          >
                            {index + 1}
                            <OutcomeMark outcome={outcome} className={cn("h-3.5 w-3.5", isCurrent && "text-background")} />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-pressed={filter === "missed"}
          onClick={() => onFilterChange(filter === "missed" ? "all" : "missed")}
          className={cn(
            "mb-1 inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-xs font-bold lg:hidden",
            filter === "missed" ? "bg-foreground text-background" : "bg-muted text-foreground",
            FOCUS_RING,
          )}
        >
          Missed ({missed})
        </button>
      </div>
    </nav>
  );
};

export default ReviewQuestionList;
