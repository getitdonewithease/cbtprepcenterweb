import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import type { PerformanceStreakDay } from "../types/dashboardTypes";

interface PerformanceStreakCardProps {
  currentStreak: number;
  monthLabel: string;
  startOffset: number;
  days: PerformanceStreakDay[];
}

const orange = "hsl(var(--brand-orange))";

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

const PerformanceStreakCard = ({
  currentStreak,
  monthLabel,
  startOffset,
  days,
}: PerformanceStreakCardProps) => {
  const leadingDays = Array.from({ length: startOffset });
  const today = new Date().getDate();

  return (
    <div className="w-full shrink-0 rounded-xl bg-card px-5 py-6 shadow-[0_10px_30px_hsl(222.2_47.4%_8%_/_0.08)] ring-1 ring-border/40 lg:w-[300px]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-medium text-foreground">Day {currentStreak}</p>
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </div>

        <div className="flex items-center gap-5 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-x-3 gap-y-4 text-center">
        {weekDays.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className="text-xs font-medium leading-none text-muted-foreground/70"
          >
            {day}
          </span>
        ))}

        {leadingDays.map((_, index) => (
          <span key={`empty-${index}`} aria-hidden="true" className="h-7" />
        ))}

        {days.map((streakDay) => {
          const isHighlighted = streakDay.completed || streakDay.day === today;

          return (
            <span
              key={streakDay.day}
              className="mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs leading-none transition-colors"
              style={{
                backgroundColor: isHighlighted ? orange : "transparent",
                color: isHighlighted ? "white" : "hsl(var(--muted-foreground))",
              }}
              aria-label={
                isHighlighted
                  ? `Day ${streakDay.day} completed`
                  : `Day ${streakDay.day} not completed`
              }
            >
              {streakDay.day}
            </span>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BadgeCheck
            className="h-5 w-5"
            fill="hsl(142 71% 45% / 0.18)"
            style={{ color: "hsl(142 71% 45%)" }}
          />
          <span className="tabular-nums">0</span>
          <button
            type="button"
            className="font-medium transition-colors hover:text-foreground"
            style={{ color: "hsl(142 71% 45%)" }}
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStreakCard;
