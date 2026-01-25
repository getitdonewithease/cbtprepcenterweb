// Value types for different auth response scenarios
export interface SignInResponseValue {
  token?: string;
}

export interface SignUpResponseValue {
  token?: string;
  // Add other fields that might come from sign-up if needed
}

export interface AuthError {
  message: string;
}

export interface ApiErrorResponse {
  errors?: Record<string, string>;
  message?: string;
}

export interface AuthResponse {
  accessToken?: string;
  message?: string;
  isSuccess?: boolean;
  value?: SignInResponseValue | SignUpResponseValue;
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
  phoneNumber?: string;
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

export interface SignUpResponse {
  isSuccess: boolean;
  value?: SignUpResponseValue;
  message?: string;
}

export interface SignInResponse {
  accessToken?: string;
  message?: string;
  isSuccess?: boolean;
  value?: SignInResponseValue;
}

export interface LogoutResponse {
  message: string;
  isSuccess?: boolean;
}

// Type guard to check if error is an API error response
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return typeof error === 'object' && error !== null && ('errors' in error || 'message' in error);
}

// Type guard to check if error has response property
export function isAxiosError(error: unknown): error is { response?: { data?: ApiErrorResponse } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}
