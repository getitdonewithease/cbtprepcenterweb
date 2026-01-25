import { authApi } from "../api/authApi";
import {
  SignInCredentials,
  SignUpData,
  SignUpResponse,
  SignInResponse,
  isAxiosError,
  isApiErrorResponse,
} from "../types/authTypes";
import { clearAccessToken, setAccessToken } from "@/lib/authToken";
import api from "@/lib/apiConfig";

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
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  },

  async handleSignUp(data: SignUpData): Promise<SignUpResponse> {
    try {
      const response = await authApi.signUp(data);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to sign up");
      }
      return response;
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  },

  async handleGoogleSignIn(idToken: string, accessToken: string): Promise<SignInResponse> {
    try {
      const response = await authApi.signInWithGoogle(idToken, accessToken);
      console.log('Google sign-in backend response:', response);
      const backendAccessToken = response.accessToken || (response.value?.token);
      if (!backendAccessToken) {
        throw new Error(response.message || "Failed to sign in with Google");
      }
      setAccessToken(backendAccessToken);
      return response;
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  },

  async handleGoogleSignUp(idToken: string, accessToken: string): Promise<SignUpResponse> {
    try {
      const response = await authApi.signUpWithGoogle(idToken, accessToken);
      console.log('Google sign-up backend response:', response);
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
      const message = extractErrorMessage(error);
      throw new Error(message);
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
};
