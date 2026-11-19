export const CHAT_QUIZ_OPTION_KEYS = ["A", "B", "C", "D"] as const;

export type ChatQuizOptionKey = (typeof CHAT_QUIZ_OPTION_KEYS)[number];

export interface ChatQuizOption {
  key: ChatQuizOptionKey;
  text: string;
}

export interface ChatQuizQuestion {
  index: number;
  question: string;
  options: ChatQuizOption[];
  answer: ChatQuizOptionKey | null;
}

export type ChatQuizSelectedAnswers = Record<number, ChatQuizOptionKey>;

export interface ChatQuizSubmission {
  score: number;
  total: number;
  formattedPrompt: string;
}
