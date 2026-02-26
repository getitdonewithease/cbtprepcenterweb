import { useState, useEffect } from 'react';
import { TestRecord } from '../types/testHistoryTypes';
import { testHistoryApi } from '../api/testHistoryApi';
import { getErrorMessage } from '@/core/errors';

export function useTestHistory(page: number, pageSize: number) {
  const [items, setItems] = useState<TestRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTestHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await testHistoryApi.fetchTestHistory(page, pageSize);
        if (isMounted) {
          setItems(data.items);
          setTotalPages(data.totalPages);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setError(getErrorMessage(error, 'Error fetching test history'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTestHistory();

    return () => {
      isMounted = false;
    };
  }, [page, pageSize]);

  return { items, totalPages, loading, error };
} 