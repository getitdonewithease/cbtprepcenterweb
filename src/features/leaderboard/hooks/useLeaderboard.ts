import { useEffect, useState } from 'react';
import { leaderboardService } from '../services/leaderboardService';
import { LeaderboardEntry } from '../types/leaderboardTypes';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    leaderboardService.getLeaderboard()
      .then(setEntries)
      .catch((err) => setError(err.message || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return { entries, loading, error };
} 