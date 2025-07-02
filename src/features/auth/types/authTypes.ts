export interface AuthResponse {
  accessToken?: string;
  message?: string;
  isSuccess?: boolean;
  value?: any;
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

export interface SignUpResponse {
  isSuccess: boolean;
  value: any;
  message?: string;
}

export interface SignInResponse {
  accessToken?: string;
  message?: string;
  isSuccess?: boolean;
  value?: any;
}
