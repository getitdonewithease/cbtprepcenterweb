import { useState, useEffect } from 'react';
import { fetchOrgStudents } from '../api/organizationApi';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgStudent } from '../types/organizationTypes';

export const useOrgStudents = (page: number, pageSize: number) => {
  const [items, setItems] = useState<OrgStudent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchOrgStudents(page, pageSize);
        if (isMounted) {
          setItems(data.items);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, 'Failed to load students'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [page, pageSize]);

  return { items, totalPages, loading, error };
};
