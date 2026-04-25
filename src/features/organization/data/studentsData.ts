import type { OrgStudent } from '../types/organizationTypes';

export const mockOrgStudents: OrgStudent[] = [
  {
    id: '1',
    firstName: 'Adebayo',
    lastName: 'Okafor',
    email: 'adebayo.okafor@fasiti.edu.ng',
    enrolledCourses: ['Mathematics', 'Physics'],
    totalTestsTaken: 14,
    avgScore: 78.2,
    joinedAt: '2025-01-15T08:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    firstName: 'Chidinma',
    lastName: 'Eze',
    email: 'chidinma.eze@fasiti.edu.ng',
    enrolledCourses: ['English Language', 'Literature', 'Government'],
    totalTestsTaken: 9,
    avgScore: 83.5,
    joinedAt: '2025-01-20T09:30:00Z',
    status: 'active',
  },
  {
    id: '3',
    firstName: 'Emeka',
    lastName: 'Nwosu',
    email: 'emeka.nwosu@fasiti.edu.ng',
    enrolledCourses: ['Chemistry', 'Biology', 'Mathematics'],
    totalTestsTaken: 21,
    avgScore: 65.1,
    joinedAt: '2025-02-03T11:00:00Z',
    status: 'active',
  },
  {
    id: '4',
    firstName: 'Fatima',
    lastName: 'Bello',
    email: 'fatima.bello@fasiti.edu.ng',
    enrolledCourses: ['Mathematics', 'Further Mathematics'],
    totalTestsTaken: 6,
    avgScore: 91.0,
    joinedAt: '2025-02-10T10:15:00Z',
    status: 'active',
  },
  {
    id: '5',
    firstName: 'Oluwaseun',
    lastName: 'Adeyemi',
    email: 'oluwaseun.adeyemi@fasiti.edu.ng',
    enrolledCourses: ['Economics', 'Government', 'English Language'],
    totalTestsTaken: 3,
    avgScore: 55.3,
    joinedAt: '2025-03-01T14:00:00Z',
    status: 'inactive',
  },
  {
    id: '6',
    firstName: 'Ngozi',
    lastName: 'Obi',
    email: 'ngozi.obi@fasiti.edu.ng',
    enrolledCourses: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    totalTestsTaken: 18,
    avgScore: 74.8,
    joinedAt: '2025-01-28T08:45:00Z',
    status: 'active',
  },
  {
    id: '7',
    firstName: 'Tunde',
    lastName: 'Fashola',
    email: 'tunde.fashola@fasiti.edu.ng',
    enrolledCourses: ['Literature', 'CRS'],
    totalTestsTaken: 0,
    avgScore: 0,
    joinedAt: '2025-03-15T09:00:00Z',
    status: 'inactive',
  },
  {
    id: '8',
    firstName: 'Amaka',
    lastName: 'Igwe',
    email: 'amaka.igwe@fasiti.edu.ng',
    enrolledCourses: ['Mathematics', 'Physics', 'Chemistry'],
    totalTestsTaken: 11,
    avgScore: 88.6,
    joinedAt: '2025-02-20T13:30:00Z',
    status: 'active',
  },
];

export const STUDENTS_PAGE_SIZE = 10;

export const getMockStudentsPage = (
  page: number,
  pageSize: number
): { items: OrgStudent[]; totalPages: number } => {
  const start = (page - 1) * pageSize;
  return {
    items: mockOrgStudents.slice(start, start + pageSize),
    totalPages: Math.ceil(mockOrgStudents.length / pageSize),
  };
};
