import { DepartmentOption, SubjectOption } from "../types/examTypes";

export const COMPULSORY_SUBJECT = "english";

export const DEPARTMENTS: DepartmentOption[] = [
  { value: "Science", label: "Science", description: "Engineering, Medicine, Computing, Physical Sciences" },
  { value: "Commercial", label: "Commercial", description: "Accounting, Business, Economics, Finance" },
  { value: "Art", label: "Art / Humanities", description: "Law, Literature, History, Mass Communication" },
];

export const departmentSubjects: Record<string, string[]> = {
  Science: ["mathematics", "english", "biology", "physics", "chemistry"],
  Commercial: [
    "mathematics",
    "english",
    "commerce",
    "accounting",
    "economics",
    "insurance",
    "geography",
    "civiledu",
    "currentaffairs",
  ],
  Art: [
    "english",
    "englishlit",
    "government",
    "crk",
    "irk",
    "history",
    "civiledu",
    "currentaffairs",
    "geography",
  ],
};

export const ALL_SUBJECTS: SubjectOption[] = [
  { value: "english", label: "English" },
  { value: "mathematics", label: "Mathematics" },
  { value: "biology", label: "Biology" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "economics", label: "Economics" },
  { value: "accounting", label: "Accounting" },
  { value: "commerce", label: "Commerce" },
  { value: "government", label: "Government" },
  { value: "englishlit", label: "Literature in English" },
  { value: "crk", label: "Christian Religious Knowledge" },
  { value: "irk", label: "Islamic Religious Knowledge" },
  { value: "geography", label: "Geography" },
  { value: "civiledu", label: "Civic Education" },
  { value: "insurance", label: "Insurance" },
  { value: "currentaffairs", label: "Current Affairs" },
  { value: "history", label: "History" },
];

const subjectLabelMap = new Map<string, string>(
  ALL_SUBJECTS.map((s) => [s.value.toLowerCase(), s.label])
);

export const getSubjectLabel = (value: string): string => {
  if (!value) return "";
  const normalized = value.toLowerCase().trim();
  return subjectLabelMap.get(normalized) || value.charAt(0).toUpperCase() + value.slice(1);
};

export const normalizeSubject = (value: string): string => {
  return value ? value.toLowerCase().trim() : "";
};
