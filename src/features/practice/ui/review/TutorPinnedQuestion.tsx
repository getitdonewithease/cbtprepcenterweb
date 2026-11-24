import type { ReviewQuestion } from "../../types/practiceTypes";
import { OutcomeMark, Rich, letterOf, outcomeOf, subjectName } from "./reviewParts";

/**
 * The question pinned at the top of the AI tutor: what it is, what you answered and the
 * answer, so the tutor's replies never need the page behind it (on a phone it covers it).
 */
const TutorPinnedQuestion = ({ question, number }: { question: ReviewQuestion; number: number }) => {
  const outcome = outcomeOf(question);
  const yours = question.userAnswer;
  const answer = question.correctAnswer;
  return (
    <section aria-label={`Question ${number}, pinned`} className="border-b pb-4">
      <p className="text-xs font-semibold text-muted-foreground">
        Question {number} · {subjectName(question.subject)}
      </p>
      <Rich content={question.text} className="mt-1 line-clamp-3 text-sm font-semibold leading-6" />
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-start gap-2">
          <dt className="flex w-32 shrink-0 items-center gap-1.5 text-muted-foreground">
            <OutcomeMark outcome={outcome} className="h-3.5 w-3.5" />
            Your answer
          </dt>
          <dd className="min-w-0 font-semibold">
            {yours === undefined || yours === null ? (
              "Skipped"
            ) : (
              <>
                {letterOf(question, yours)} · <Rich content={question.options[yours]} inline className="inline" />
              </>
            )}
          </dd>
        </div>
        {answer !== undefined && answer >= 0 && (
          <div className="flex items-start gap-2">
            <dt className="flex w-32 shrink-0 items-center gap-1.5 text-muted-foreground">
              <OutcomeMark outcome="right" className="h-3.5 w-3.5" />
              Correct answer
            </dt>
            <dd className="min-w-0 font-semibold">
              {letterOf(question, answer)} · <Rich content={question.options[answer]} inline className="inline" />
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
};

export default TutorPinnedQuestion;
