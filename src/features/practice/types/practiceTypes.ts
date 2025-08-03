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

 