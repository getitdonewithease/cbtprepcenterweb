import { leaderboardApi } from '../api/leaderboardApi';
import { LeaderboardEntry } from '../types/leaderboardTypes';
 
export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return leaderboardApi.fetchLeaderboard();
  },
}; 