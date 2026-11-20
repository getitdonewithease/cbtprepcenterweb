import { authApi } from "../api/authApi";
import {
  SignInCredentials,
  SignUpData,
  SignUpResponse,
  SignInResponse,
  ForgotPasswordValidationIssue,
  isAxiosError,
  isApiErrorResponse,
} from "../types/authTypes";
import { clearAccessToken, setAccessToken } from "@/core/auth/tokenStorage";
import { AppError } from "@/core/errors";
import api from "@/core/api/httpClient";

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (isApiErrorResponse(data)) {
      if (data.errors) {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey) {
          return firstKey;
        }
      }
      if (data.message) {
        return data.message;
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

type ForgotPasswordResult = {
  isValidationError: boolean;
  message?: string;
};

function extractForgotValidationMessage(error: unknown): string | null {
  if (!isAxiosError(error) || !error.response) {
    return null;
  }

  const { status, data } = error.response as {
    status?: number;
    data?: unknown;
  };

  if (status !== 400) {
    return null;
  }

  if (Array.isArray(data) && data.length > 0) {
    const issue = data[0] as ForgotPasswordValidationIssue;
    return issue?.description || "Please enter a valid email address.";
  }

  return "Please enter a valid email address.";
}


// ── User-facing auth errors ──────────────────────────────────────────────────
// The UI never shows raw backend text (CLAUDE.md). Each failure becomes an AppError
// with plain, actionable copy; the original error stays attached as `cause`.

export type AuthAction = "signIn" | "signUp" | "googleSignIn" | "googleSignUp";

export const AUTH_ERROR_CODE = "AUTH_ERROR";

const statusOf = (error: unknown): number | undefined => {
  if (error instanceof AppError) return error.context?.statusCode;
  if (isAxiosError(error)) return (error.response as { status?: number } | undefined)?.status;
  return undefined;
};

const isNetworkFailure = (error: unknown): boolean => {
  if (isAxiosError(error)) return !error.response;
  return error instanceof AppError && error.context?.statusCode === undefined && /network/i.test(error.message);
};

const looksLikeDuplicateAccount = (error: unknown): boolean =>
  statusOf(error) === 409 ||
  (error instanceof Error && /already|exist|taken|registered|duplicate/i.test(error.message));

const authErrorMessage = (error: unknown, action: AuthAction): string => {
  const status = statusOf(error);
  if (isNetworkFailure(error)) {
    return "We couldn't reach Fasiti. Check your internet connection and try again.";
  }
  if (status === 429) return "Too many attempts. Wait a minute, then try again.";
  if (status !== undefined && status >= 500) {
    return "Something went wrong on our side. Please try again in a moment.";
  }
  switch (action) {
    case "signIn":
      return "That email and password don't match. Check them, or reset your password.";
    case "signUp":
      return looksLikeDuplicateAccount(error)
        ? "An account with this email already exists. Sign in instead."
        : "We couldn't create your account. Check your details and try again.";
    case "googleSignIn":
      return "Google sign-in didn't work. Try again, or sign in with your email and password.";
    case "googleSignUp":
      return looksLikeDuplicateAccount(error)
        ? "This Google account already has a Fasiti account. Sign in instead."
        : "Google sign-up didn't work. Try again, or sign up with your email.";
  }
};

export const toAuthError = (error: unknown, action: AuthAction): AppError => {
  if (error instanceof AppError && error.code === AUTH_ERROR_CODE) return error;
  return new AppError(authErrorMessage(error, action), AUTH_ERROR_CODE, { statusCode: statusOf(error) }, error);
};

export const authService = {
  async handleSignIn(credentials: SignInCredentials): Promise<SignInResponse> {
    try {
      const response = await authApi.signIn(credentials);
      if (!response.accessToken) {
        throw new Error(response.message || "Failed to sign in");
      }
      setAccessToken(response.accessToken);
      return response;
    } catch (error: unknown) {
      throw toAuthError(error, "signIn");
    }
  },

  async handleSignUp(data: SignUpData): Promise<SignUpResponse> {
    try {
      const normalizedCourses = Array.isArray(data.courses)
        ? data.courses.map(c => c.toLowerCase().trim())
        : [];
      const payload: SignUpData = {
        ...data,
        courses: normalizedCourses,
      };
      const response = await authApi.signUp(payload);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to sign up");
      }
      return response;
    } catch (error: unknown) {
      throw toAuthError(error, "signUp");
    }
  },

  async handleGoogleSignIn(idToken: string, accessToken: string): Promise<SignInResponse> {
    try {
      const response = await authApi.signInWithGoogle(idToken, accessToken);
      const backendAccessToken = response.accessToken || (response.value?.token);
      if (!backendAccessToken) {
        throw new Error(response.message || "Failed to sign in with Google");
      }
      setAccessToken(backendAccessToken);
      return response;
    } catch (error: unknown) {
      throw toAuthError(error, "googleSignIn");
    }
  },

  async handleGoogleSignUp(idToken: string, accessToken: string): Promise<SignUpResponse> {
    try {
      const response = await authApi.signUpWithGoogle(idToken, accessToken);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to sign up with Google");
      }
      // For sign-up, the response might include an accessToken directly or in value
      const backendAccessToken = (response as SignInResponse).accessToken || response.value?.token;
      if (!backendAccessToken) {
        throw new Error("No authentication token received");
      }
      setAccessToken(backendAccessToken);
      return response;
    } catch (error: unknown) {
      throw toAuthError(error, "googleSignUp");
    }
  },

  async handleLogout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error: unknown) {
      // Even if logout fails (e.g., invalid token), clear local state to prevent ghost sessions
      const message = extractErrorMessage(error);
      clearAccessToken();
      delete api.defaults.headers.common["Authorization"];
      throw new Error(message);
    }
    clearAccessToken();
    delete api.defaults.headers.common["Authorization"];
  },

  async handleForgotPassword(registeredEmail: string): Promise<ForgotPasswordResult> {
    try {
      await authApi.forgotPassword(registeredEmail);
      return { isValidationError: false };
    } catch (error: unknown) {
      const validationMessage = extractForgotValidationMessage(error);
      if (validationMessage) {
        return {
          isValidationError: true,
          message: validationMessage,
        };
      }

      return { isValidationError: false };
    }
  },
};
