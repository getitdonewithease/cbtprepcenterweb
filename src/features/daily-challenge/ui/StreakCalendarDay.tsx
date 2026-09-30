import React from "react";
import { CalendarDayModel } from "../types/dailyChallengeTypes";

interface StreakCalendarDayProps {
  day: CalendarDayModel;
  onClick: (dateString: string, day: CalendarDayModel) => void;
}

const orange = "hsl(var(--brand-orange))";

export const StreakCalendarDay: React.FC<StreakCalendarDayProps> = ({ day, onClick }) => {
  const { dayNumber, dateString, statusVisual, isFuture, isClickable } = day;

  const handleClick = () => {
    if (isClickable) {
      onClick(dateString, day);
    }
  };

  // Determine tooltip label
  const getTooltipTitle = () => {
    switch (statusVisual) {
      case "completed":
        return `${dateString}: Completed (Click to review)`;
      case "late_completion":
        return `${dateString}: Completed late (Click to review)`;
      case "missed":
        return `${dateString}: Missed (Click to take)`;
      case "today_pending":
        return `${dateString}: Today's Challenge (Click to start)`;
      case "future":
        return `${dateString}: Upcoming`;
      default:
        return dateString;
    }
  };

  // Render styles according to statusVisual
  if (statusVisual === "completed") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={getTooltipTitle()}
        aria-label={getTooltipTitle()}
        className="group relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:scale-105 active:scale-95"
        style={{ backgroundColor: "hsl(142 71% 45%)" }}
      >
        <span>{dayNumber}</span>
      </button>
    );
  }

  if (statusVisual === "late_completion") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={getTooltipTitle()}
        aria-label={getTooltipTitle()}
        className="group relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs font-bold text-blue-600 border-2 border-blue-500 bg-blue-500/10 shadow-sm transition-all duration-150 hover:scale-105 hover:bg-blue-500/15 active:scale-95"
      >
        <span>{dayNumber}</span>
      </button>
    );
  }

  if (statusVisual === "today_pending") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={getTooltipTitle()}
        aria-label={getTooltipTitle()}
        className="group relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:scale-105 active:scale-95"
        style={{ backgroundColor: orange }}
      >
        <span>{dayNumber}</span>
      </button>
    );
  }

  if (statusVisual === "missed") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={getTooltipTitle()}
        aria-label={getTooltipTitle()}
        className="group relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs font-medium text-foreground transition-all duration-150 hover:bg-muted active:scale-95"
      >
        <span className="leading-none">{dayNumber}</span>
        <span
          className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-red-500"
          aria-hidden="true"
        />
      </button>
    );
  }

  // Future / unclickable date
  return (
    <span
      aria-hidden="true"
      title={isFuture ? "Upcoming challenge" : undefined}
      className="mx-auto flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full text-xs font-normal text-muted-foreground/40 select-none"
    >
      {dayNumber}
    </span>
  );
};
