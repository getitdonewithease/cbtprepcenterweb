import { cn } from "@/core/ui/cn";
import { FOCUS_RING } from "@/core/ui/styles";
import { isAnswered } from "../../service/testScreenService";
import type { SubjectBlock, TestScreenAnswers, TestScreenQuestion } from "../../types/testScreenTypes";

/**
 * One subject's question numbers, as on the exam: numbered within the subject, filled once
 * answered (the number stays), the current one in the brand colour.
 */

interface QuestionNumbersProps {
  questions: TestScreenQuestion[];
  subject: SubjectBlock;
  current: number;
  answers: TestScreenAnswers;
  onGo: (index: number) => void;
  /** Grid columns, e.g. "grid-cols-6". */
  columns: string;
}

const QuestionNumbers = ({ questions, subject, current, answers, onGo, columns }: QuestionNumbersProps) => {
  const answered = questions.slice(subject.start, subject.start + subject.count).filter((q) => isAnswered(answers, q.id)).length;
  return (
    <>
      <ol className={cn("grid gap-1.5", columns)}>
        {Array.from({ length: subject.count }, (_, k) => {
          const i = subject.start + k;
          const done = isAnswered(answers, questions[i].id);
          const here = i === current;
          return (
            <li key={questions[i].id}>
              <button
                type="button"
                onClick={() => onGo(i)}
                aria-current={here ? "step" : undefined}
                aria-label={`${subject.name} question ${k + 1}, ${done ? "answered" : "not answered"}`}
                className={cn(
                  "flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold tabular-nums",
                  here ? "bg-primary text-primary-foreground" : done ? "bg-foreground/10 text-foreground hover:bg-foreground/15" : "border text-muted-foreground hover:bg-muted",
                  FOCUS_RING,
                )}
              >
                {k + 1}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-foreground/10" aria-hidden="true" /> Answered {answered}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-muted-foreground/50" aria-hidden="true" /> Not yet {subject.count - answered}
        </span>
      </p>
    </>
  );
};

export default QuestionNumbers;
