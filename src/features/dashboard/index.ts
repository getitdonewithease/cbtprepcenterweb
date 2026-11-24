// Public exports for dashboard feature
export { useDashboard } from './hooks/useDashboard';
export { useDashboardCards } from './hooks/useDashboardCards';
export { useUser } from './hooks/useUser';
export { usePrepareTest } from './hooks/usePrepareTest';
export { useTutorSuggestions } from './hooks/useTutorSuggestions';
export type { TutorSuggestion } from './service/tutorSuggestionsService';
export { UserProvider, useUserContext } from './contexts/UserContext';
export { StartTestProvider, useStartTest } from './contexts/StartTestContext';
export { default as StartTestButton } from './ui/StartTestButton';
export { default as StartTestDialogs } from './ui/StartTestDialogs';
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
