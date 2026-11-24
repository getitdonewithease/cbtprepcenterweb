import {
  CalendarDayModel,
  CompletionStatus,
  DailyChallengeStreakValue,
  DailyChallengeQuestionsValue,
  DailyChallengeQuestion,
  DailyChallengeSubmissionValue,
  DailyChallengeCompletionValue,
  StreakHistoryItem,
} from "../types/dailyChallengeTypes";
import {
  getDailyChallengeQuestions,
  getStudentStreak,
  submitDailyChallenge,
  getDailyChallengeCompletion,
} from "../api/dailyChallengeApi";

export const formatYearMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const formatYearMonthDay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMonthLabel = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

/**
 * Normalizes backend date strings to "YYYY-MM-DD".
 */
export const normalizeDateString = (dateStr: string): string => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

/**
 * Builds the calendar days for a specific year and month, calculating
 * visual status states. A day only counts as missed when a challenge existed on it
 * and the student had already joined; if either is unknown, it is just unattempted.
 */
export const buildCalendarDays = (
  year: number,
  monthIndex: number, // 0-based: 0 for Jan, 8 for Sep
  streak: Pick<DailyChallengeStreakValue, "history" | "joinedOn" | "today" | "challengeDates">,
  deviceToday: Date = new Date()
): {
  startOffset: number;
  days: CalendarDayModel[];
} => {
  const { history, joinedOn, challengeDates } = streak;
  const todayString = streak.today ?? formatYearMonthDay(deviceToday);
  const availableDates = challengeDates ? new Set(challengeDates) : null;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = new Date(year, monthIndex, 1).getDay();

  // Create a quick lookup map by normalized date string
  const historyMap = new Map<string, StreakHistoryItem>();
  for (const item of history) {
    historyMap.set(normalizeDateString(item.date), item);
  }

  const days: CalendarDayModel[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, monthIndex, day);
    const dateString = formatYearMonthDay(currentDate);

    const isToday = dateString === todayString;
    const isFuture = dateString > todayString;
    const historyItem = historyMap.get(dateString);
    const isBeforeJoining = joinedOn !== undefined && dateString < joinedOn;

    let statusVisual: CalendarDayModel["statusVisual"] = "unattempted";
    let completionStatus: CompletionStatus | undefined;
    let dailyChallengeId: string | null = null;

    if (historyItem) {
      completionStatus = historyItem.status;
      dailyChallengeId = historyItem.dailyChallengeId;

      if (historyItem.status === CompletionStatus.Completed) {
        statusVisual = "completed";
      } else if (historyItem.status === CompletionStatus.LateCompletion) {
        statusVisual = "late_completion";
      } else if (isToday) {
        // Today is still active and ongoing - never mark as missed
        statusVisual = "today_pending";
      } else {
        statusVisual = isBeforeJoining ? "unattempted" : "missed";
      }
    } else {
      // Not in history:
      if (isFuture) {
        statusVisual = "future";
      } else if (availableDates && !availableDates.has(dateString)) {
        statusVisual = "unavailable";
      } else if (isToday) {
        // Today and not yet started
        statusVisual = "today_pending";
      } else if (availableDates && joinedOn && !isBeforeJoining) {
        statusVisual = "missed";
      }
    }

    days.push({
      dayNumber: day,
      dateString,
      statusVisual,
      completionStatus,
      dailyChallengeId,
      isToday,
      isFuture,
      isClickable: !isFuture && statusVisual !== "unavailable",
    });
  }

  return {
    startOffset,
    days,
  };
};

export const dailyChallengeService = {
  getStreakData: async (monthStr: string): Promise<DailyChallengeStreakValue> => {
    return await getStudentStreak(monthStr);
  },

  getQuestionsForDate: async (dateStr: string): Promise<DailyChallengeQuestionsValue> => {
    return await getDailyChallengeQuestions(dateStr);
  },

  submitChallenge: async (
    dailyChallengeId: string,
    answers: Record<string, string>,
    questions: DailyChallengeQuestion[]
  ): Promise<DailyChallengeSubmissionValue> => {
    const questionAnswers = questions.map((q) => ({
      questionId: q.questionId,
      chosenOption: answers[q.questionId] ?? "",
    }));

    return await submitDailyChallenge(dailyChallengeId, { questionAnswers });
  },

  getCompletionReview: async (dateStr: string): Promise<DailyChallengeCompletionValue> => {
    return await getDailyChallengeCompletion(dateStr);
  },
};


// The hook tells "no finished challenge" apart from a failure to load
export { DAILY_REVIEW_NOT_FOUND } from "../api/dailyChallengeApi";
