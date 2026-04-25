import { useState, useEffect } from 'react';
import {
  fetchOrgResources,
  fetchStudentOrgResources,
  createOrgResource,
  deleteOrgResource,
} from '../api/organizationApi';
import { getErrorMessage } from '@/core/errors/utils';
import type { OrgResource, CreateResourcePayload } from '../types/organizationTypes';

export const useOrgResources = (isAdmin: boolean) => {
  const [resources, setResources] = useState<OrgResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = isAdmin ? await fetchOrgResources() : await fetchStudentOrgResources();
        if (isMounted) setResources(data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, 'Failed to load resources'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [isAdmin]);

  const addResource = async (payload: CreateResourcePayload) => {
    const created = await createOrgResource(payload);
    setResources((prev) => [created, ...prev]);
    return created;
  };

  const removeResource = async (resourceId: string) => {
    await deleteOrgResource(resourceId);
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
  };

  return { resources, loading, error, addResource, removeResource };
};
