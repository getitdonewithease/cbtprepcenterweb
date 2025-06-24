export interface AuthResponse {
  accessToken: string;
  message?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
} 