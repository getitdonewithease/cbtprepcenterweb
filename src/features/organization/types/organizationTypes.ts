export type OrgRole = 'org_admin' | 'student' | 'teacher';

export interface OrgDashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  totalAssessments: number;
  totalResources: number;
  avgOrganizationScore: number;
}

export interface StudentOrgStats {
  enrolledCourses: number;
  completedAssessments: number;
  pendingAssessments: number;
  avgScore: number;
  availableResources: number;
}

export interface OrgStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  enrolledCourses: string[];
  totalTestsTaken: number;
  avgScore: number;
  joinedAt: string;
  status: 'active' | 'inactive';
}

export interface OrgCourse {
  id: string;
  name: string;
  subject: string;
  description?: string;
  enrolledCount: number;
  createdAt: string;
  status: 'active' | 'archived';
  resourceCount: number;
  assessmentCount: number;
}

export interface OrgAssessment {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  dueDate?: string;
  status: 'draft' | 'published' | 'closed';
  totalSubmissions: number;
  avgScore?: number;
  createdAt: string;
  durationMinutes: number;
  totalQuestions: number;
}

export interface StudentAssessment extends OrgAssessment {
  submissionStatus: 'not-started' | 'submitted';
  myScore?: number;
  submittedAt?: string;
}

export interface OrgResource {
  id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  courseId?: string;
  courseName?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CreateCoursePayload {
  name: string;
  subject: string;
  description?: string;
}

export interface CreateAssessmentPayload {
  title: string;
  courseId: string;
  durationMinutes: number;
  dueDate?: string;
}

export interface CreateResourcePayload {
  title: string;
  description?: string;
  type: OrgResource['type'];
  url: string;
  courseId?: string;
}
