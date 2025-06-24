export interface TestSubject {
  name: string;
  score: number;
}

export type TestStatus = 'not-started' | 'in-progress' | 'submitted' | 'cancelled';

export interface TestRecord {
  id: string;
  date: string;
  subjects: Array<{
    name: string;
    score: number;
  }>;
  score: number;
  timeUsed: string;
  avgSpeed: string;
  status: 'not-started' | 'in-progress' | 'submitted' | 'cancelled';
  numberOfQuestion: number;
  numberOfQuestionAttempted: number;
  numberOfCorrectAnswers: number;
  numberOfWrongAnswers: number;
}

export interface TestConfiguration {
  cbtSessionId: string;
  preparedQuestion: any; // TODO: Define proper type for prepared question
  examConfig: {
    time: number;
    questions: number;
  };
  status: 'not-started' | 'in-progress' | 'submitted' | 'cancelled';
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
} 