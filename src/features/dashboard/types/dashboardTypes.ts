export interface UserProfile {
  courses: any[];
  studentId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  totalScore: number;
  totalNumberOfTestTaken: number;
  hasJoinedLeaderboard: boolean;
  isPremium?: boolean;
  rank?: number;
  totalAverageSpeed?: string;
}

export interface SubjectPerformance {
  subjectName: string;
  percentage: number;
}

export interface SubjectPerformanceDetail {
  subject: string;
  score: number;
  accuracy: number;
  speed: number;
  weakTopics: Array<{
    name: string;
    score: number;
  }>;
}

export interface TopicConfidence {
  topicName: string;
  subjectName: string;
  confidenceLevelValue: number;
  confidenceLevel: "Low" | "Medium" | "High" | string;
}

export interface RecentTest {
  testId: string;
  dateTaken: string;
  practiceTestType: PracticeTestType;
  subjects: {
    name: string;
    score: number;
    scorePercentage: number;
  }[];
  totalScorePercentage: number;
  numberOfCorrectAnswers: number;
  numberOfQuestionsAttempted: number;
  averageSpeed: string;
  maxScore: number;
}

export interface TestConfig {
  cbtSessionId: string;
  preparedQuestion: any; // Define this more strictly if possible
  duration: string;
  totalQuestionsCount: number;
  status: number;
}

export interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
} 

export enum PracticeTestType {
  Custom = 1,
  Standard,
  Mock,
}

export interface PrepareTestPayload {
  duration: string;
  courses: Record<string, number>;
  practiceTestType: PracticeTestType;
}