import React from "react";
import { ReviewQuestion } from "./practiceTypes";

export interface TestReviewPerformance {
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattemptedAnswers?: number;
  scorePercent?: number;
  customMetrics?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

export interface ReviewQuestionNavigatorProps {
  questions: ReviewQuestion[];
  currentIndex: number;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  onJumpToQuestion: (index: number) => void;
  className?: string;
}

export interface ReviewPerformanceCardProps {
  performance: TestReviewPerformance;
  className?: string;
}

export interface TestReviewViewProps<TRaw = unknown> {
  questions: ReviewQuestion[];
  currentIndex: number;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onJumpToQuestion: (index: number) => void;

  // Performance metrics card
  performance?: TestReviewPerformance;
  performanceSlot?: React.ReactNode;

  // Header controls
  headerSlot?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  headerChipsSlot?: React.ReactNode;
  headerActionsSlot?: React.ReactNode;

  // Solutions & Actions
  showSolution?: boolean;
  onToggleSolution?: () => void;
  onSaveQuestion?: (questionId: string) => void;
  isSavingQuestion?: boolean;
  hideSaveButton?: boolean;
  hideSolutionButton?: boolean;

  // Optional AI Chat Panel (Resizable sidebar)
  chatPanelSlot?: React.ReactNode;
  showChatPanel?: boolean;
  isChatFullscreen?: boolean;
  onCloseChat?: () => void;
  onToggleChatFullscreen?: () => void;

  containerClassName?: string;
  raw?: TRaw;
}
