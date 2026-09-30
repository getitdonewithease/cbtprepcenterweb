export enum CompletionStatus {
  Completed = 1,
  LateCompletion = 2,
  Missed = 3,
}

export interface StreakHistoryItem {
  date: string; // "YYYY-MM-DD"
  status: CompletionStatus;
  dailyChallengeId: string | null;
}

export interface DailyChallengeStreakValue {
  currentStreak: number;
  longestStreak: number;
  history: StreakHistoryItem[];
}

export interface DailyChallengeStreakResponse {
  isSuccess: boolean;
  value: DailyChallengeStreakValue | null;
  message: string | null;
}

export interface DailyChallengeQuestionOption {
  label: string; // e.g. "A", "B", "C", "D"
  content: string | null;
  imageUrl: string | null;
}

export interface DailyChallengeQuestion {
  questionId: string;
  subjectName: string;
  questionContent: string;
  imageUrl: string | null;
  options: DailyChallengeQuestionOption[];
}

export interface DailyChallengeQuestionsValue {
  dailyChallengeId: string;
  questions: DailyChallengeQuestion[];
}

export interface DailyChallengeQuestionsResponse {
  isSuccess: boolean;
  value: DailyChallengeQuestionsValue | null;
  message: string | null;
}

export type DayStatusVisual = "completed" | "late_completion" | "missed" | "today_pending" | "future" | "unattempted";

export interface CalendarDayModel {
  dayNumber: number;
  dateString: string; // "YYYY-MM-DD"
  statusVisual: DayStatusVisual;
  completionStatus?: CompletionStatus;
  dailyChallengeId: string | null;
  isToday: boolean;
  isFuture: boolean;
  isClickable: boolean;
}

export interface DailyChallengeAnswerItem {
  questionId: string;
  chosenOption: string;
}

export interface SubmitDailyChallengePayload {
  questionAnswers: DailyChallengeAnswerItem[];
}

export interface DailyChallengeSubmissionValue {
  dailyChallengeId:
    | {
        value: string;
      }
    | string;
  completionStatus: number;
  score: number;
  currentStreakCount: number;
  totalQuestions?: number;
  correctAnswers?: number;
}

export interface DailyChallengeSubmissionResponse {
  isSuccess: boolean;
  value: DailyChallengeSubmissionValue | null;
  message: string | null;
}

export interface DailyChallengeReviewOption {
  label: string; // e.g. "A", "B", "C", "D"
  content: string | null;
  isCorrect: boolean;
  imageUrl: string | null;
}

export interface DailyChallengeReviewQuestion {
  questionId: string;
  subjectName: string;
  questionContent: string;
  imageUrl: string | null;
  chosenOption: string | null;
  isChosenOptionCorrect: boolean;
  options: DailyChallengeReviewOption[];
}

export interface DailyChallengeCompletionValue {
  dailyChallengeId: string;
  targetDate: string; // "YYYY-MM-DD"
  completionStatus: CompletionStatus | number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  questions: DailyChallengeReviewQuestion[];
}

export interface DailyChallengeCompletionResponse {
  isSuccess: boolean;
  value: DailyChallengeCompletionValue | null;
  message: string | null;
}

