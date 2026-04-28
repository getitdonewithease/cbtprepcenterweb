// Public exports for dashboard feature
export { useDashboard } from './hooks/useDashboard';
export { useDashboardCards } from './hooks/useDashboardCards';
export { useUser } from './hooks/useUser';
export { usePrepareTest } from './hooks/usePrepareTest';
export { UserProvider, useUserContext } from './contexts/UserContext';
export { default as UserSubjectsWarning } from './ui/UserSubjectsWarning';
export type {
  UserProfile,
  RecentTest,
  SubjectPerformance,
  SubjectPerformanceDetail,
  TopicConfidence,
  TestConfig,
  PrepareTestPayload,
  DashboardCards,
} from './types/dashboardTypes';
