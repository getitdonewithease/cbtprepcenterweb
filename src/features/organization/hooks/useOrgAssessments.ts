import { useState, useEffect } from 'react';
import {
  fetchOrgAssessments,
  fetchStudentOrgAssessments,
  createOrgAssessment,
  updateOrgAssessmentStatus,
} from '../api/organizationApi';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgAssessment, StudentAssessment, CreateAssessmentPayload } from '../types/organizationTypes';

export const useOrgAssessments = (isAdmin: boolean) => {
  const [assessments, setAssessments] = useState<(OrgAssessment | StudentAssessment)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = isAdmin
          ? await fetchOrgAssessments()
          : await fetchStudentOrgAssessments();
        if (isMounted) setAssessments(data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, 'Failed to load assessments'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [isAdmin]);

  const addAssessment = async (payload: CreateAssessmentPayload) => {
    const created = await createOrgAssessment(payload);
    setAssessments((prev) => [created, ...prev]);
    return created;
  };

  const changeStatus = async (assessmentId: string, status: OrgAssessment['status']) => {
    await updateOrgAssessmentStatus(assessmentId, status);
    setAssessments((prev) =>
      prev.map((a) => (a.id === assessmentId ? { ...a, status } : a))
    );
  };

  return { assessments, loading, error, addAssessment, changeStatus };
};
