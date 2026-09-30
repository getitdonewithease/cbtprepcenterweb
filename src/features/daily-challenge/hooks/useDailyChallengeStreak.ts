import { useState, useEffect, useCallback, useMemo } from "react";
import { CalendarDayModel } from "../types/dailyChallengeTypes";
import {
  buildCalendarDays,
  dailyChallengeService,
  formatYearMonth,
  getMonthLabel,
} from "../service/dailyChallengeService";
import { getErrorMessage } from "@/core/errors";

export const useDailyChallengeStreak = () => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [calendarDays, setCalendarDays] = useState<CalendarDayModel[]>([]);
  const [startOffset, setStartOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const monthParam = useMemo(() => formatYearMonth(viewDate), [viewDate]);
  const monthLabel = useMemo(() => getMonthLabel(viewDate), [viewDate]);

  // Prevent navigating further than the current actual month
  const canGoNext = useMemo(() => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return nextMonth <= thisMonth;
  }, [viewDate, today]);

  const goToPrevMonth = useCallback(() => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    if (!canGoNext) return;
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, [canGoNext]);

  const loadStreak = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const streakData = await dailyChallengeService.getStreakData(monthParam);

      setCurrentStreak(streakData.currentStreak ?? 0);
      setLongestStreak(streakData.longestStreak ?? 0);

      const { startOffset: offset, days } = buildCalendarDays(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        streakData.history ?? [],
        today
      );

      setStartOffset(offset);
      setCalendarDays(days);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to load streak details");
      setError(message);

      // Fallback empty calendar grid on error
      const { startOffset: offset, days } = buildCalendarDays(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        [],
        today
      );
      setStartOffset(offset);
      setCalendarDays(days);
    } finally {
      setLoading(false);
    }
  }, [monthParam, viewDate, today]);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  return {
    viewDate,
    monthLabel,
    monthParam,
    currentStreak,
    longestStreak,
    calendarDays,
    startOffset,
    loading,
    error,
    canGoNext,
    goToPrevMonth,
    goToNextMonth,
    refetch: loadStreak,
  };
};
