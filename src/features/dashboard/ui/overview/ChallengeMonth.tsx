import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/core/ui/cn";
import { FOCUS_RING, PRESSABLE } from "@/core/ui/styles";
import { formatDayMonth } from "@/core/utils/formatDate";
import type { CalendarDayModel, DayStatusVisual } from "@/features/daily-challenge";
import { SECTION, SectionError, SectionHeading, Skeleton, secondaryButton } from "./sheetParts";

/**
 * The daily challenge as a whole month, led by the month total so past consistency counts
 * even after a missed day. Every state has its own mark, not only a colour, and a key.
 */

interface ChallengeMonthProps {
  label: string;
  days: CalendarDayModel[];
  /** Blank cells before day 1, Monday first. */
  offset: number;
  totals: { done: number; available: number };
  currentStreak: number | null;
  longestStreak: number;
  /** Dates (YYYY-MM-DD) on which a test was taken. */
  testDates: Set<string>;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  canGoNext: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATE_NAME: Record<DayStatusVisual, string> = {
  completed: "done",
  late_completion: "done late",
  missed: "missed",
  today_pending: "today, not done yet",
  future: "upcoming",
  unattempted: "no challenge for you",
  unavailable: "no challenge that day",
};

const isDone = (d: CalendarDayModel) => d.statusVisual === "completed" || d.statusVisual === "late_completion";

const dayHref = (d: CalendarDayModel) =>
  isDone(d) ? `/daily-challenge/review/${d.dateString}` : `/daily-challenge/${d.dateString}`;

const DayCell = ({ day, testTaken }: { day: CalendarDayModel; testTaken: boolean }) => {
  const s = day.statusVisual;
  const name = `${formatDayMonth(day.dateString)}, ${STATE_NAME[s]}${testTaken ? ", test taken" : ""}`;
  const cell = cn(
    "relative flex aspect-square min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold",
    s === "completed" && "bg-brand-orange/15 text-foreground",
    s === "late_completion" && "bg-brand-orange/[0.07] text-foreground",
    s === "missed" && "border border-dashed border-muted-foreground/50 text-muted-foreground",
    s === "today_pending" && "border-2 border-brand-orange text-foreground",
    (s === "future" || s === "unattempted" || s === "unavailable") && "text-muted-foreground",
  );
  const body = (
    <>
      <span className="tabular-nums">{day.dayNumber}</span>
      {isDone(day) && (
        <Check
          className={cn("h-3 w-3 text-brand-text", s === "late_completion" && "opacity-70")}
          strokeWidth={3}
          aria-hidden="true"
        />
      )}
      {testTaken && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden="true" />}
    </>
  );

  return (
    <li>
      {day.isClickable ? (
        <Link to={dayHref(day)} aria-label={name} className={cn(cell, "hover:ring-2 hover:ring-border", FOCUS_RING)}>
          {body}
        </Link>
      ) : (
        <span className={cell}>
          {body}
          <span className="sr-only">{name}</span>
        </span>
      )}
    </li>
  );
};

const KeyItem = ({ mark, label }: { mark: ReactNode; label: string }) => (
  <li className="flex items-center gap-1.5">
    {mark}
    {label}
  </li>
);

const ChallengeMonth = ({
  label,
  days,
  offset,
  totals,
  currentStreak,
  longestStreak,
  testDates,
  isLoading,
  error,
  onRetry,
  canGoNext,
  onPrevMonth,
  onNextMonth,
}: ChallengeMonthProps) => {
  const today = days.find((d) => d.isToday);
  const todayDone = today ? isDone(today) : false;
  const navButton = cn("inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted disabled:text-muted-foreground/40 disabled:hover:bg-transparent", PRESSABLE, FOCUS_RING);

  return (
    // Capped as one block, so the days stay a calm size on wide screens
    <section aria-labelledby="month-heading" className={cn(SECTION, "max-w-[28rem]")}>
      <SectionHeading
        id="month-heading"
        aside={
          <span className="flex items-center gap-1">
            <button type="button" onClick={onPrevMonth} aria-label="Previous month" className={navButton}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={onNextMonth} disabled={!canGoNext} aria-label="Next month" className={navButton}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </span>
        }
      >
        Daily challenge
      </SectionHeading>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-1" aria-live="polite">
        <p>
          <span className="block text-sm text-muted-foreground">{label}</span>
          <span className="text-xl font-semibold tabular-nums">
            {isLoading || error
              ? " "
              : totals.available === 0
                ? "No challenges yet this month"
                : `${totals.done} of ${totals.available} ${totals.available === 1 ? "day" : "days"}`}
          </span>
        </p>
        {!isLoading && !error && currentStreak !== null && (
          <p className="text-sm text-muted-foreground">
            Streak <span className="font-bold text-foreground tabular-nums">{currentStreak}</span>
            <span aria-hidden="true"> · </span>
            <span className="sr-only">, </span>
            best <span className="font-bold text-foreground tabular-nums">{longestStreak}</span>
          </p>
        )}
      </div>

      {error ? (
        <SectionError message={error} onRetry={onRetry} />
      ) : (
        <div className="mt-5">
          <ol className="grid grid-cols-7 gap-1.5 text-center" aria-hidden="true">
            {WEEKDAYS.map((w) => (
              <li key={w} className="pb-1 text-xs font-semibold text-muted-foreground">
                {w.slice(0, 1)}
                <span className="hidden sm:inline">{w.slice(1)}</span>
              </li>
            ))}
          </ol>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1.5" aria-busy="true" aria-label="Loading the month">
              {Array.from({ length: 35 }, (_, i) => (
                <Skeleton key={i} className="aspect-square min-h-11 rounded-lg" />
              ))}
            </div>
          ) : (
            <ol className="grid grid-cols-7 gap-1.5" aria-label={`${label}, daily challenge by day`}>
              {Array.from({ length: offset }, (_, i) => (
                <li key={`pad-${i}`} aria-hidden="true" />
              ))}
              {days.map((d) => (
                <DayCell key={d.dateString} day={d} testTaken={testDates.has(d.dateString)} />
              ))}
            </ol>
          )}
        </div>
      )}

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Key">
        <KeyItem
          label="Done"
          mark={
            <span className="flex h-4 w-4 items-center justify-center rounded bg-brand-orange/15 text-brand-text" aria-hidden="true">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          }
        />
        <KeyItem
          label="Done late"
          mark={
            <span className="flex h-4 w-4 items-center justify-center rounded bg-brand-orange/[0.07] text-brand-text" aria-hidden="true">
              <Check className="h-2.5 w-2.5 opacity-70" strokeWidth={3} />
            </span>
          }
        />
        <KeyItem label="Missed" mark={<span className="h-4 w-4 rounded border border-dashed border-muted-foreground/50" aria-hidden="true" />} />
        <KeyItem label="Today" mark={<span className="h-4 w-4 rounded border-2 border-brand-orange" aria-hidden="true" />} />
        <KeyItem label="Test taken" mark={<span className="h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden="true" />} />
      </ul>

      {today && (
        <Link to={dayHref(today)} className={secondaryButton("mt-5 w-full sm:w-auto")}>
          {todayDone ? "Review today's challenge" : "Start today's challenge"}
        </Link>
      )}
    </section>
  );
};

export default ChallengeMonth;
