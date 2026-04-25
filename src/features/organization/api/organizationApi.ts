import type {
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
} from '../types/organizationTypes';
import { mockOrgDashboardStats, mockStudentOrgStats } from '../data/dashboardData';
import { getMockStudentsPage } from '../data/studentsData';
import {
  mockOrgCourses,
  mockStudentOrgCourses,
} from '../data/coursesData';
import {
  mockOrgAssessments,
  mockStudentAssessments,
} from '../data/assessmentsData';
import {
  mockOrgResources,
  mockStudentOrgResources,
} from '../data/resourcesData';

const delay = (ms = 400) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Admin: Dashboard ────────────────────────────────────────────────────────

export const fetchOrgDashboardStats = async (): Promise<OrgDashboardStats> => {
  await delay();
  return { ...mockOrgDashboardStats };
};

// ─── Admin: Students ─────────────────────────────────────────────────────────

export const fetchOrgStudents = async (
  page: number,
  pageSize: number
): Promise<{ items: OrgStudent[]; totalPages: number }> => {
  await delay();
  return getMockStudentsPage(page, pageSize);
};

export const fetchOrgStudent = async (studentId: string): Promise<OrgStudent> => {
  await delay();
  const { items } = getMockStudentsPage(1, 100);
  const student = items.find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found');
  return { ...student };
};

// ─── Admin: Courses ───────────────────────────────────────────────────────────

export const fetchOrgCourses = async (): Promise<OrgCourse[]> => {
  await delay();
  return [...mockOrgCourses];
};

export const createOrgCourse = async (data: CreateCoursePayload): Promise<OrgCourse> => {
  await delay(600);
  const newCourse: OrgCourse = {
    id: String(Date.now()),
    name: data.name,
    subject: data.subject,
    description: data.description,
    enrolledCount: 0,
    createdAt: new Date().toISOString(),
    status: 'active',
    resourceCount: 0,
    assessmentCount: 0,
  };
  mockOrgCourses.unshift(newCourse);
  return { ...newCourse };
};

export const updateOrgCourseStatus = async (
  courseId: string,
  status: OrgCourse['status']
): Promise<void> => {
  await delay();
  const course = mockOrgCourses.find((c) => c.id === courseId);
  if (course) course.status = status;
};

// ─── Admin: Assessments ───────────────────────────────────────────────────────

export const fetchOrgAssessments = async (): Promise<OrgAssessment[]> => {
  await delay();
  return [...mockOrgAssessments];
};

export const createOrgAssessment = async (
  data: CreateAssessmentPayload
): Promise<OrgAssessment> => {
  await delay(600);
  const newAssessment: OrgAssessment = {
    id: String(Date.now()),
    title: data.title,
    courseId: data.courseId,
    courseName: mockOrgCourses.find((c) => c.id === data.courseId)?.name ?? data.courseId,
    dueDate: data.dueDate,
    status: 'draft',
    totalSubmissions: 0,
    avgScore: undefined,
    createdAt: new Date().toISOString(),
    durationMinutes: data.durationMinutes,
    totalQuestions: 0,
  };
  mockOrgAssessments.unshift(newAssessment);
  return { ...newAssessment };
};

export const updateOrgAssessmentStatus = async (
  assessmentId: string,
  status: OrgAssessment['status']
): Promise<void> => {
  await delay();
  const assessment = mockOrgAssessments.find((a) => a.id === assessmentId);
  if (assessment) assessment.status = status;
};

// ─── Admin: Resources ─────────────────────────────────────────────────────────

export const fetchOrgResources = async (): Promise<OrgResource[]> => {
  await delay();
  return [...mockOrgResources];
};

export const createOrgResource = async (data: CreateResourcePayload): Promise<OrgResource> => {
  await delay(600);
  const newResource: OrgResource = {
    id: String(Date.now()),
    title: data.title,
    description: data.description,
    type: data.type,
    url: data.url,
    courseId: data.courseId,
    courseName: data.courseId
      ? mockOrgCourses.find((c) => c.id === data.courseId)?.name
      : undefined,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'Admin',
  };
  mockOrgResources.unshift(newResource);
  return { ...newResource };
};

export const deleteOrgResource = async (resourceId: string): Promise<void> => {
  await delay();
  const idx = mockOrgResources.findIndex((r) => r.id === resourceId);
  if (idx !== -1) mockOrgResources.splice(idx, 1);
};

// ─── Student: Stats ───────────────────────────────────────────────────────────

export const fetchStudentOrgStats = async (): Promise<StudentOrgStats> => {
  await delay();
  return { ...mockStudentOrgStats };
};

// ─── Student: Courses ─────────────────────────────────────────────────────────

export const fetchStudentOrgCourses = async (): Promise<OrgCourse[]> => {
  await delay();
  return [...mockStudentOrgCourses];
};

// ─── Student: Assessments ─────────────────────────────────────────────────────

export const fetchStudentOrgAssessments = async (): Promise<StudentAssessment[]> => {
  await delay();
  return [...mockStudentAssessments];
};

// ─── Student: Resources ───────────────────────────────────────────────────────

export const fetchStudentOrgResources = async (): Promise<OrgResource[]> => {
  await delay();
  return [...mockStudentOrgResources];
};
