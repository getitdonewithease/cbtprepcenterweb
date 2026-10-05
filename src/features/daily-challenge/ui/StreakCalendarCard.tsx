import React from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Flame, Trophy, Loader2 } from "lucide-react";
import { CalendarDayModel } from "../types/dailyChallengeTypes";
import { StreakCalendarDay } from "./StreakCalendarDay";

interface StreakCalendarCardProps {
  currentStreak: number;
  longestStreak: number;
  monthLabel: string;
  startOffset: number;
  calendarDays: CalendarDayModel[];
  loading?: boolean;
  canGoNext?: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateString: string, day: CalendarDayModel) => void;
}

const orange = "hsl(var(--brand-orange))";
const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

export const StreakCalendarCard: React.FC<StreakCalendarCardProps> = ({
  currentStreak,
  longestStreak,
  monthLabel,
  startOffset,
  calendarDays,
  loading = false,
  canGoNext = false,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) => {
  const leadingDays = Array.from({ length: startOffset });

  return (
    <div className="w-full shrink-0 rounded-2xl bg-card p-5 shadow-[0_10px_30px_hsl(222.2_47.4%_8%_/_0.08)] ring-1 ring-border/50 transition-shadow lg:w-[320px]">
      {/* ── Streak Counters Header ── */}
      {/* <div className="flex items-center justify-between border-b border-border/50 pb-4"> */}
        {/* Current Streak */}
        {/* <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform hover:scale-105"
            style={{ backgroundColor: "hsl(25 95% 53% / 0.12)" }}
          >
            <Flame className="h-5 w-5 fill-current" style={{ color: orange }} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{currentStreak}</span>
              <span className="text-xs text-muted-foreground">day{currentStreak === 1 ? "" : "s"}</span>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Current Streak
            </p>
          </div>
        </div> */}

        {/* Longest Streak */}
        {/* <div className="flex items-center gap-2 text-right">
          <div>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-lg font-bold text-foreground">{longestStreak}</span>
              <span className="text-xs text-muted-foreground">day{longestStreak === 1 ? "" : "s"}</span>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
              Best Streak
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="h-4 w-4" />
          </div>
        </div> */}
      {/* </div> */}

      {/* ── Month & Navigation Controls ── */}
      <div className="my-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!canGoNext}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Days Grid ── */}
      <div className="grid grid-cols-7 gap-x-1 gap-y-2 text-center">
        {weekDays.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className="text-[11px] font-semibold uppercase text-muted-foreground/70"
          >
            {day}
          </span>
        ))}

        {leadingDays.map((_, index) => (
          <span key={`empty-${index}`} aria-hidden="true" className="h-8 w-8" />
        ))}

        {calendarDays.map((day) => (
          <StreakCalendarDay
            key={day.dateString}
            day={day}
            onClick={onSelectDate}
          />
        ))}
      </div>

      {/* ── Legend ── */}
      {/* <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(142 71% 45%)" }} />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-blue-500/20" />
          <span>Late completion</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: orange }} />
          <span>Today</span>
        </div>
      </div> */}

      {/* ── Footer Points / Redeem ── */}
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BadgeCheck
            className="h-5 w-5"
            fill="hsl(142 71% 45% / 0.18)"
            style={{ color: "hsl(142 71% 45%)" }}
          />
          <span className="tabular-nums">0 pts</span>
        </div>
        <button
          type="button"
          className="text-xs font-semibold transition-colors hover:underline"
          style={{ color: "hsl(142 71% 45%)" }}
        >
          Redeem
        </button>
      </div>
    </div>
  );
};
