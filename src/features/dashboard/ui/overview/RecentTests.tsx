import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING } from "@/core/ui/styles";
import { formatShortDate } from "@/core/utils/formatDate";
import type { LedgerRow } from "../../service/dashboardSummaryService";
import { SECTION, SectionError, SectionHeading, Skeleton, textLink } from "./sheetParts";

/** The last five tests as a ledger: full tests out of 400, practice as a percentage. */

interface RecentTestsProps {
  rows: LedgerRow[];
  isLoading: boolean;
  error: string;
}

const RecentTests = ({ rows, isLoading, error }: RecentTestsProps) => (
  <section aria-labelledby="tests-heading" className={SECTION}>
    <SectionHeading
      id="tests-heading"
      aside={
        rows.length > 0 ? (
          <Link to="/test-history" className={textLink}>
            All tests
          </Link>
        ) : undefined
      }
    >
      Recent tests
    </SectionHeading>

    {isLoading ? (
      <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading your recent tests">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    ) : error ? (
      <SectionError message="We couldn't load your recent tests. Reload the page to try again." />
    ) : rows.length === 0 ? (
      <p className="mt-3 text-pretty text-muted-foreground">
        Your tests will be listed here, newest first, each with a review of every question.
      </p>
    ) : (
      <ul className="mt-2">
        {rows.map((row) => (
          <li key={row.testId} className="border-t first:border-t-0">
            <Link
              to={`/practice/review/${row.testId}`}
              aria-label={`Review ${row.kind.toLowerCase()} of ${formatShortDate(row.takenOn)}, ${row.score}`}
              className={cn("group -mx-2 flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted", FOCUS_RING)}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {row.kind}
                  <span className="font-normal text-muted-foreground">, {formatShortDate(row.takenOn)}</span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {row.subjects} · {row.detail}
                </span>
              </span>
              <span className="shrink-0 text-right text-sm font-extrabold tabular-nums">{row.score}</span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-brand-text transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default RecentTests;
