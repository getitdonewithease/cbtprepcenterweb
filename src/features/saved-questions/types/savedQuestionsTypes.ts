// Saved Questions API Types
export interface SavedQuestionOption {
  optionContent: string;
  optionAlpha: string;
  isCorrect: boolean;
  imageUrl: string | null;
}

export interface SavedQuestionApiResponse {
  questionId: string;
  subjectName: string;
  questionContent: string;
  examType: string;
  examYear: string;
  section: string;
  solution: string;
  imageUrl: string;
  chosenOption: string;
  isChosenOptionCorrect: boolean;
  savedOn: string;
  note: string;
  optionCommandResponses: SavedQuestionOption[];
}

export interface SavedQuestionsApiResponse {
  isSuccess: boolean;
  value: {
    savedQuestions: SavedQuestionApiResponse[];
  };
  message: string;
}

// Mapped saved question type for UI
export interface SavedQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  examType: string;
  examYear: string;
  section?: string;
  imageUrl?: string;
  userAnswer?: number;
  isCorrect: boolean;
  isSaved: boolean;
  dateSaved?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  solution?: string;
  optionAlphas: string[];
  optionImages: (string | null)[];
  note?: string;
}

// Note-related types
export interface QuestionNote {
  questionId: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteApiResponse {
  isSuccess: boolean;
  value?: {
    questionId: string;
    note: string;
    updatedAt: string;
  };
  message: string;
} 