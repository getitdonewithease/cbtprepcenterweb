import { authApi } from "../api/authApi";
import {
  SignInCredentials,
  SignUpData,
  SignUpResponse,
  SignInResponse,
} from "../types/authTypes";

export const authService = {
  async handleSignIn(credentials: SignInCredentials): Promise<SignInResponse> {
    try {
      const response = await authApi.signIn(credentials);
      if (!response.accessToken) {
        throw new Error(response.message || "Failed to sign in");
      }
      localStorage.setItem("token", response.accessToken);
      return response;
    } catch (error: any) {
      let message = "Failed to sign in";
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
          message = firstKey;
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
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
    } catch (error: any) {
      let message = "Failed to sign up";
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
          message = firstKey;
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      throw new Error(message);
    }
  },

  async handleGoogleSignIn(): Promise<SignInResponse> {
    throw new Error("Google sign-in not implemented");
  },
};
