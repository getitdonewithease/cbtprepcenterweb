export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer?: number;
    subject: string;
    examType?: string;
    examYear?: string;
    imageUrl?: string;
    section?: string;
    optionAlphas?: string[];
    optionImages?: string[];
  }
  
  export interface TestResult {
    score: number;
    totalQuestions: number;
    timeSpent: number;
    answers: Record<string, number>;
    testIntegrity: {
      tabSwitchCount: number;
      tabSwitchHistory: Array<{ timestamp: Date; action: 'left' | 'returned' }>;
    };
  }
  
  export interface TestInterfaceProps {
    subject?: string;
    questions?: Question[];
    timeLimit?: number; // in minutes
    onComplete?: (results: TestResult) => void;
    isPremium?: boolean;
  }
  
  export interface CountdownRendererProps {
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }
  
  export interface ExamConfig {
    duration: string;
    totalQuestionsCount: number;
  }
  
  export interface PreparedQuestion {
    [subject: string]: number;
  }
  
  export interface LocationState {
    cbtSessionId: string;
    preparedQuestion: PreparedQuestion;
    examConfig: ExamConfig;
    status: number | string;
  } 

  // Test Review Types
  export interface ReviewQuestion extends Question {
    userAnswer?: number;
    isCorrect?: boolean;
    explanation?: string;
    isSaved?: boolean;
  }

  export interface TestReviewData {
    sessionId: string;
    questions: ReviewQuestion[];
    userAnswers: Record<string, number>;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    testIntegrity: {
      tabSwitchCount: number;
      tabSwitchHistory: Array<{ timestamp: Date; action: 'left' | 'returned' }>;
    };
  }

  export interface AIExplanationRequest {
    questionId: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    userAnswer?: number;
  }

  export interface AIExplanationResponse {
    explanation: string;
    reasoning: string;
    tips: string[];
  }

  export interface TestReviewProps {
    sessionId: string;
    onBack?: () => void;
  }

  // API Response Types
  export interface SubmissionQuestionResponse {
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
    optionCommandResponses: Array<{
      optionContent: string;
      optionAlpha: string;
      isCorrect: boolean;
      imageUrl: string | null;
    }>;
  }

  export interface TestResultsApiResponse {
    cbtSessionId: string;
    score: number;
    duration: string;
    durationUsed: string;
    averageSpeed: string;
    numberOfQuestion: number;
    numberOfQuestionAttempted: number;
    numberOfWrongAnswers: number;
    numberOfCorrectAnswers: number;
    submissionQuestions: SubmissionQuestionResponse[];
  } 

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
    optionCommandResponses: SavedQuestionOption[];
    savedOn: string;
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