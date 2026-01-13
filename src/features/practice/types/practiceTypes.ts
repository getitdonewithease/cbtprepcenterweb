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
    timeRemaining: string;
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
    solution?: string;
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

  // Test Progress Tracking Types
  export interface TestProgress {
    sessionId: string;
    currentQuestionIndex: number;
    answers: Record<string, number>;
    // Prefer passing precomputed questionAnswers using server-provided optionAlpha
    questionAnswers?: Array<{ questionId: string; chosenOption: string }>;
    timeRemaining: number;
    remainingTime: string; // Format: "HH:MM:SS" - for API payload
    lastSaved: number;
    tabSwitchCount: number;
    tabSwitchHistory: Array<{ timestamp: Date; action: 'left' | 'returned' }>;
    isProgressSave?: boolean; // Flag to indicate this is a progress save, not final submission
  }

  export interface ProgressSaveOptions {
    isDebounced?: boolean;
    isPeriodic?: boolean;
    isBeforeUnload?: boolean;
    isFiveQuestionTrigger?: boolean;
  }

  // Test Status Constants
  export const TEST_STATUS = {
    NOT_STARTED: 1,
    IN_PROGRESS: 2,
    SUBMITTED: 3,
    CANCELLED: 4
  } as const;

 