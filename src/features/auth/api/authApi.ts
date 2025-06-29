import {
  AuthResponse,
  SignInCredentials,
  SignUpData,
  SignUpResponse,
  SignInResponse,
} from "../types/authTypes";
import api from "../../../lib/apiConfig";

export const authApi = {
  async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    const response = await api.post<SignInResponse>("/api/v1/token", credentials);
    return response.data;
  },

  async signUp(data: SignUpData): Promise<SignUpResponse> {
    const response = await api.post<SignUpResponse>("/api/v1/students/initialize", data);
    return response.data;
  },

  async signInWithGoogle(): Promise<AuthResponse> {
    // Implement Google sign-in
    throw new Error("Not implemented");
  },
};
