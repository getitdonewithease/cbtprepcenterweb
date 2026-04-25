export { default as DashboardRouter } from './ui/DashboardRouter';
export { default as OrgAdminDashboardPage } from './ui/OrgAdminDashboardPage';
export { default as StudentOrgDashboardPage } from './ui/StudentOrgDashboardPage';
export { default as StudentsListPage } from './ui/StudentsListPage';
export { default as CoursesPage } from './ui/CoursesPage';
export { default as AssessmentsPage } from './ui/AssessmentsPage';
export { default as ResourcesPage } from './ui/ResourcesPage';

export type {
  OrgRole,
  OrgDashboardStats,
  StudentOrgStats,
  OrgStudent,
  OrgCourse,
  OrgAssessment,
  StudentAssessment,
  OrgResource,
  CreateCoursePayload,
  CreateAssessmentPayload,
  CreateResourcePayload,
} from './types/organizationTypes';
