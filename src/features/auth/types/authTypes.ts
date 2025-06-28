export interface AuthResponse {
  accessToken: string;
  message?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  department: string;
  courses: string[];
  universityOfChoice?: string;
  courseOfChoice?: string;
  numberOfUTMEWritten?: number;
  targetScore?: number;
  studyHoursPerDay?: number;
  preferredStudyTime?: string;
  weakSubjects?: string[];
}

export interface AuthError {
  message: string;
}
