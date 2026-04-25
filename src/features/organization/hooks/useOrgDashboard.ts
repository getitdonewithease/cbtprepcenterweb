import { useState, useEffect } from 'react';
import { fetchOrgDashboardStats, fetchStudentOrgStats } from '../api/organizationApi';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgDashboardStats, StudentOrgStats } from '../types/organizationTypes';

export const useOrgAdminDashboard = () => {
  const [stats, setStats] = useState<OrgDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchOrgDashboardStats();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, 'Failed to load dashboard'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return { stats, loading, error };
};

export const useStudentOrgDashboard = () => {
  const [stats, setStats] = useState<StudentOrgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchStudentOrgStats();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, 'Failed to load dashboard'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return { stats, loading, error };
};
