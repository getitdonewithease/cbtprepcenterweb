import type { UserProfile } from '../types/dashboardTypes';

// Dev-only fallback used when the real API is unreachable (network error).
// Set organizationRole to 'org_admin' | 'student' | undefined to test different views.
export const mockUserProfile: UserProfile = {
  courses: ['Mathematics', 'Physics', 'Chemistry'],
  studentId: 'mock-student-001',
  firstName: 'Test',
  lastName: 'Admin',
  email: 'admin@fasiti.edu.ng',
  totalScore: 2840,
  totalNumberOfTestTaken: 12,
  hasJoinedLeaderboard: true,
  isPremium: false,
  rank: 42,
  totalAverageSpeed: '00:01:30',
  organizationRole: 'org_admin',
  organizationId: 'org-001',
  organizationName: 'Fasiti Academy',
};
