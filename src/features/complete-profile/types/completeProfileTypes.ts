export interface CompleteProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  department: string;
  examType: string;
  selectedSubjects: string[];
  weakSubjects: string[];
  universityOfChoice: string;
  courseOfChoice: string;
  numberOfUTMEWritten: number;
  targetScore: number;
  studyHoursPerDay: number;
}

export interface CompleteProfilePayload {
  firstName: string;
  lastName: string;
  department: string;
  courses: string[];
  avatar?: string;
}

export interface StudentMeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  department?: string;
  courses?: string[];
}

export interface StudentMeResponse {
  isSuccess: boolean;
  message?: string;
  value?: StudentMeData;
}
