import type { OrgDashboardStats, StudentOrgStats } from '../types/organizationTypes';

export const mockOrgDashboardStats: OrgDashboardStats = {
  totalStudents: 247,
  activeStudents: 198,
  totalCourses: 12,
  totalAssessments: 34,
  totalResources: 89,
  avgOrganizationScore: 72.4,
};

export const mockStudentOrgStats: StudentOrgStats = {
  enrolledCourses: 4,
  completedAssessments: 7,
  pendingAssessments: 3,
  avgScore: 68.5,
  availableResources: 24,
};
