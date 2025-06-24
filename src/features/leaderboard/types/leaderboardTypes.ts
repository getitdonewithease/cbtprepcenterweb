export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  accuracy: number;
  speed: number; // in seconds
  subjects: string[];
  isCurrentUser?: boolean;
} 