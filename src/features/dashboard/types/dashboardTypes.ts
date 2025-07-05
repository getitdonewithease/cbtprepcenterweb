export interface UserProfile {
  courses: any[];
  studentId: string;
  firstName: string;
  totalScore: number;
  totalNumberOfTestTaken: number;
  hasJoinedLeaderboard: boolean;
  rank?: number;
  totalAverageSpeed?: string;
}

export interface SubjectPerformance {
  subjectName: string;
  percentage: number;
}

export interface RecentTest {
  testId: string;
  dateTaken: string;
  subjects: {
    name: string;
    score: number;
  }[];
  numberOfCorrectAnswers: number;
  numberOfQuestionsAttempted: number;
  averageSpeed: string;
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