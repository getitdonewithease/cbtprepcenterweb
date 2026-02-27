import {
  AuthResponse,
  SignInCredentials,
  SignUpData,
  SignUpResponse,
  SignInResponse,
  LogoutResponse,
} from "../types/authTypes";
import api from "@/core/api/httpClient";

export const authApi = {
  async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    const response = await api.post<SignInResponse>("/api/v1/token", credentials);
    return response.data;
  },

  async signUp(data: SignUpData): Promise<SignUpResponse> {
    const response = await api.post<SignUpResponse>("/api/v1/students/initialize", data);
    return response.data;
  },

  async signInWithGoogle(idToken: string, accessToken: string): Promise<SignInResponse> {
    const response = await api.get<SignInResponse>(
      "/api/v1/token/google",
      {
        params: {
          authType: "SignIn",
        },
        headers: {
          "X-ID-Token": idToken,
          "GoogleApiAccessToken": accessToken,
        },
      }
    );
    return response.data;
  },

  async signUpWithGoogle(idToken: string, accessToken: string): Promise<SignUpResponse> {
    const response = await api.get<SignUpResponse>(
      "/api/v1/token/google",
      {
        params: {
          authType: "SignUp",
        },
        headers: {
          "X-ID-Token": idToken,
          "GoogleApiAccessToken": accessToken,
        },
      }
    );
    return response.data;
  },

  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>("/api/v1/logout");
    return response.data;
  },
};
