export {
  activeExams,
  exams,
  getExamByCode,
  getExamLabel,
  normalizeExamCode,
} from "./data/examCatalog";

export {
  ALL_SUBJECTS,
  COMPULSORY_SUBJECT,
  DEPARTMENTS,
  departmentSubjects,
  getSubjectLabel,
  normalizeSubject,
} from "./data/subjectCatalog";

export {
  NIGERIAN_UNIVERSITIES,
  POPULAR_COURSES,
  STUDY_HOURS,
} from "./data/academicCatalog";

export type {
  ExamCode,
  ExamFocusArea,
  ExamOption,
  SubjectOption,
  DepartmentOption,
} from "./types/examTypes";
