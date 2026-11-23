import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CalendarDayModel } from "../types/dailyChallengeTypes";
import {
  buildCalendarDays,
  dailyChallengeService,
  formatYearMonth,
  getMonthLabel,
} from "../service/dailyChallengeService";

export const useDailyChallengeStreak = () => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  // null until the first successful load: an unknown streak is not a streak of 0
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [calendarDays, setCalendarDays] = useState<CalendarDayModel[]>([]);
  const [startOffset, setStartOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const latestRequestRef = useRef(0);

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
    const requestId = ++latestRequestRef.current;
    const isStale = () => requestId !== latestRequestRef.current;

    try {
      setLoading(true);
      setError(null);
      setCalendarDays([]);

      const streakData = await dailyChallengeService.getStreakData(monthParam);
      if (isStale()) return;

      setCurrentStreak(streakData.currentStreak ?? 0);
      setLongestStreak(streakData.longestStreak ?? 0);

      const { startOffset: offset, days } = buildCalendarDays(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        { ...streakData, history: streakData.history ?? [] },
        today
      );

      setStartOffset(offset);
      setCalendarDays(days);
    } catch {
      if (isStale()) return;
      // No fallback grid: with no data, every day would look like a real result
      setError("We couldn't load your challenge history.");
    } finally {
      if (!isStale()) setLoading(false);
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
