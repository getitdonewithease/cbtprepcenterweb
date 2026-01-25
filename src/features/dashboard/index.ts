// Public exports for dashboard feature
export { useDashboard } from './hooks/useDashboard';
export { useUser } from './hooks/useUser';
export { usePrepareTest } from './hooks/usePrepareTest';
export { UserProvider, useUserContext } from './contexts/UserContext';
export type {
  UserProfile,
  RecentTest,
  SubjectPerformance,
  TestConfig,
  PrepareTestPayload,
} from './types/dashboardTypes';
