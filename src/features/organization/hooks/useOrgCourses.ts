import { useState, useEffect } from 'react';
import {
  fetchOrgCourses,
  fetchStudentOrgCourses,
  createOrgCourse,
  updateOrgCourseStatus,
} from '../api/organizationApi';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgCourse, CreateCoursePayload } from '../types/organizationTypes';

export const useOrgCourses = (isAdmin: boolean) => {
  const [courses, setCourses] = useState<OrgCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = isAdmin ? await fetchOrgCourses() : await fetchStudentOrgCourses();
        if (isMounted) setCourses(data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, 'Failed to load courses'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [isAdmin]);

  const addCourse = async (payload: CreateCoursePayload) => {
    const created = await createOrgCourse(payload);
    setCourses((prev) => [created, ...prev]);
    return created;
  };

  const archiveCourse = async (courseId: string) => {
    await updateOrgCourseStatus(courseId, 'archived');
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: 'archived' } : c))
    );
  };

  return { courses, loading, error, addCourse, archiveCourse };
};
