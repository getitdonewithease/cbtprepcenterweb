import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { formatShortDate } from "@/core/utils/formatDate";
import { type ScoreSummary, UTME_MAX, targetPace } from "../../service/dashboardSummaryService";
import { Change, SECTION, SectionError, Skeleton, secondaryButton, textLink } from "./sheetParts";

/**
 * The result slip: the latest full UTME practice as a score out of 400, the four subject
 * marks with the target pace drawn on every bar. Without a full test it shows practice
 * averages per subject and says plainly that there is no total yet.
 */

interface ScoreSlipProps {
  summary: ScoreSummary;
  isLoading: boolean;
  error: string;
  onStartFullTest: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** A mark out of 100, with the target pace drawn across the bar. */
const PaceBar = ({ value, pace }: { value: number | null; pace: number }) => (
  <span className="relative block h-2.5 rounded-full bg-muted">
    {value !== null && value > 0 && (
      <span className="block h-full rounded-full bg-brand-orange" style={{ width: `${Math.min(value, 100)}%` }} />
    )}
    <span
      className="absolute -inset-y-1 w-[3px] -translate-x-1/2 rounded-full bg-foreground ring-2 ring-card"
      style={{ left: `${pace}%` }}
    />
  </span>
);

const Headline = ({ summary }: { summary: ScoreSummary }) => {
  if (summary.kind === "full-test") {
    const gap = summary.target - summary.total;
    return (
      <>
        <p className="font-display text-7xl font-extrabold leading-none tracking-[-0.04em] tabular-nums">
          {summary.total}
          <span className="ml-1 text-3xl font-bold tracking-[-0.02em] text-muted-foreground">/ {UTME_MAX}</span>
        </p>
        <div className="mt-3 space-y-1">
          <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
            Latest full UTME practice, {formatShortDate(summary.takenOn)}
            {summary.change !== null && <Change value={summary.change} />}
          </p>
          <p className="text-lg font-bold">
            {gap > 0
              ? `${gap} ${gap === 1 ? "mark" : "marks"} short of your ${summary.target} target`
              : gap === 0
                ? `Exactly on your ${summary.target} target`
                : `${-gap} marks above your ${summary.target} target`}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="font-display text-7xl font-extrabold leading-none tracking-[-0.04em] tabular-nums">
        <span aria-hidden="true">—</span>
        <span className="sr-only">No score yet</span>
        <span className="ml-1 text-3xl font-bold tracking-[-0.02em] text-muted-foreground">/ {UTME_MAX}</span>
      </p>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        {summary.kind === "practice"
          ? "Your score out of 400 comes from a full UTME practice: four subjects, timed. Until then, the marks below are your practice averages."
          : "Sit a full UTME practice in your four subjects, timed like the real exam, to get your score out of 400."}
      </p>
    </>
  );
};

const ScoreSlip = ({ summary, isLoading, error, onStartFullTest }: ScoreSlipProps) => {
  const pace = targetPace(summary.target);

  return (
    <section aria-labelledby="score-heading" className={SECTION}>
      <h2 id="score-heading" className="sr-only">
        Your UTME score
      </h2>

      {isLoading ? (
        <div aria-busy="true" aria-label="Loading your score" className="space-y-4">
          <Skeleton className="h-16 w-48" />
          <Skeleton className="h-4 w-64" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : error ? (
        <SectionError message="We couldn't load your scores. Your results are safe; reload the page to try again." />
      ) : (
        <>
          <Headline summary={summary} />

          <table className="mt-6 w-full text-sm">
            <caption className="sr-only">
              {summary.kind === "full-test" ? "Marks per subject out of 100" : "Practice average per subject, out of 100"}
            </caption>
            <tbody>
              {summary.subjects.map((s) => (
                <tr key={s.subject} className="border-t">
                  <th scope="row" className="w-[40%] py-3 pr-3 text-left font-semibold">
                    {s.subject}
                  </th>
                  <td className="py-3" aria-hidden="true">
                    <PaceBar value={s.mark} pace={pace} />
                  </td>
                  <td className="w-14 py-3 pl-3 text-right text-base font-extrabold tabular-nums">
                    {s.mark === null ? (
                      <>
                        <span aria-hidden="true" className="text-muted-foreground">—</span>
                        <span className="sr-only">not taken yet</span>
                      </>
                    ) : summary.kind === "full-test" ? (
                      s.mark
                    ) : (
                      `${s.mark}%`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-3 w-[3px] shrink-0 rounded-full bg-foreground" aria-hidden="true" />
            The line is your {summary.target} pace: {pace} in each subject.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {summary.kind === "full-test" ? (
              <Link to={`/practice/review/${summary.testId}`} className={textLink}>
                Review this test <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <button type="button" onClick={onStartFullTest} className={secondaryButton("w-full sm:w-auto")}>
                <Play className="h-4 w-4" aria-hidden="true" />
                Start a full UTME practice
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ScoreSlip;
