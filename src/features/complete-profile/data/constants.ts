export const DEPARTMENTS = [
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

export const ALL_SUBJECTS = [
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

export const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "Lagos State University (LASU)",
  "Ahmadu Bello University (ABU)",
  "University of Nigeria, Nsukka (UNN)",
  "University of Benin (UNIBEN)",
  "Federal University of Technology, Akure (FUTA)",
  "Covenant University",
  "Babcock University",
  "Redeemer's University",
  "Other",
];

export const POPULAR_COURSES = [
  "Medicine and Surgery",
  "Law",
  "Pharmacy",
  "Computer Science",
  "Engineering (Computer)",
  "Engineering (Electrical)",
  "Engineering (Mechanical)",
  "Engineering (Civil)",
  "Accounting",
  "Economics",
  "Business Administration",
  "Mass Communication",
  "Psychology",
  "Architecture",
  "Nursing",
  "Other",
];

export const STUDY_HOURS = ['1', '2', '3', '4', '5', '6+'];

export const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=oluwaseun",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=adebayo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=kemi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=tunde",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=folake",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=emeka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=chioma",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=yusuf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=blessing",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=daniel",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=fatima",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=chinedu",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=amina",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=samuel",
];
