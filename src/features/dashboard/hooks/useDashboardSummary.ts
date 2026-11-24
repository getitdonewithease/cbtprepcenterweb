import { useMemo } from "react";
import { formatYearMonthDay, useDailyChallengeStreak } from "@/features/daily-challenge";
import { useDashboard } from "./useDashboard";
import {
  buildLedger,
  buildScoreSummary,
  mondayOffset,
  monthTotal,
  pickStudyFocus,
} from "../service/dashboardSummaryService";

/**
 * The dashboard's view model: raw dashboard and daily-challenge data passed through the
 * summary rules. Each section keeps its own loading and error state.
 */
export const useDashboardSummary = () => {
  const dashboard = useDashboard();
  const month = useDailyChallengeStreak();

  const courses = useMemo(() => dashboard.user?.courses ?? [], [dashboard.user]);

  const score = useMemo(
    () => buildScoreSummary(courses, dashboard.recentTests, dashboard.subjectsPerformance, dashboard.user?.targetScore),
    [courses, dashboard.recentTests, dashboard.subjectsPerformance, dashboard.user?.targetScore],
  );

  const focus = useMemo(
    () => pickStudyFocus(courses, dashboard.subjectsPerformance, dashboard.topicConfidences),
    [courses, dashboard.subjectsPerformance, dashboard.topicConfidences],
  );

  const ledger = useMemo(() => buildLedger(dashboard.recentTests), [dashboard.recentTests]);
  const totals = useMemo(() => monthTotal(month.calendarDays), [month.calendarDays]);
  const testDates = useMemo(
    () => new Set(dashboard.recentTests.map((t) => formatYearMonthDay(new Date(t.dateTaken)))),
    [dashboard.recentTests],
  );

  return {
    user: dashboard.user,
    userLoading: dashboard.userLoading,
    userError: dashboard.userError,
    score,
    scoreLoading: dashboard.recentTestsLoading || dashboard.subjectsPerformanceLoading,
    // Without recent tests we can't tell whether a full test exists, so the slip says so
    scoreError: dashboard.recentTestsError || dashboard.subjectsPerformanceError,
    focus,
    focusLoading: dashboard.subjectsPerformanceLoading || dashboard.topicConfidencesLoading,
    ledger,
    ledgerLoading: dashboard.recentTestsLoading,
    ledgerError: dashboard.recentTestsError,
    month: {
      label: month.monthLabel,
      days: month.calendarDays,
      offset: mondayOffset(month.startOffset),
      totals,
      testDates,
      currentStreak: month.currentStreak,
      longestStreak: month.longestStreak,
      loading: month.loading,
      error: month.error,
      retry: month.refetch,
      canGoNext: month.canGoNext,
      goToPrevMonth: month.goToPrevMonth,
      goToNextMonth: month.goToNextMonth,
    },
  };
};
