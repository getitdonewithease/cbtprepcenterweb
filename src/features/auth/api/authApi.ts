import {
  AuthResponse,
  SignInCredentials,
  SignUpData,
} from "../types/authTypes";
import api from "../../../lib/apiConfig";

export const authApi = {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/v1/token", credentials);
    return response.data;
  },

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/v1/register", data);
    return response.data;
  },

  async signInWithGoogle(): Promise<AuthResponse> {
    // Implement Google sign-in
    throw new Error("Not implemented");
  },
};
