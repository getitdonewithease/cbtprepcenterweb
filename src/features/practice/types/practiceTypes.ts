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
    time: string;
    questions: number;
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