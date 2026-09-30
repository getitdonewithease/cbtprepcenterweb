import React from "react";

export interface TestRunnerOption {
  id: string;
  content?: string | null;
  imageUrl?: string | null;
  label?: string;
}

export interface TestRunnerQuestion<TRaw = unknown> {
  id: string;
  subject: string;
  content: string;
  section?: string | null;
  imageUrl?: string | null;
  tag?: string;
  options: TestRunnerOption[];
  raw?: TRaw;
}

export interface QuestionNavigatorProps {
  questions: TestRunnerQuestion[];
  currentIndex: number;
  answers: Record<string, string | number>;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  onJumpToQuestion: (index: number) => void;
  className?: string;
}

export interface QuestionCardProps {
  question: TestRunnerQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId?: string;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  actionButtonSlot?: React.ReactNode;
  footerStatusSlot?: React.ReactNode;
  className?: string;
}

export interface TestRunnerViewProps<TRaw = unknown> {
  questions: TestRunnerQuestion<TRaw>[];
  currentIndex: number;
  answers: Record<string, string | number>;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onJumpToQuestion: (index: number) => void;
  headerSlot?: React.ReactNode;
  alertsSlot?: React.ReactNode;
  actionButtonSlot?: React.ReactNode;
  footerStatusSlot?: React.ReactNode;
  containerClassName?: string;
}
