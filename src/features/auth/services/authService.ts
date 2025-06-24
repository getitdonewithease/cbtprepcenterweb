import { authApi } from '../api/authApi';
import { SignInCredentials, AuthResponse } from '../types/authTypes';

export const authService = {
  async handleSignIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const response = await authApi.signIn(credentials);
    if (!response.accessToken) {
      throw new Error(response.message || 'Failed to sign in');
    }
    localStorage.setItem('token', response.accessToken);
    return response;
  },

  async handleGoogleSignIn(): Promise<AuthResponse> {
    return authApi.signInWithGoogle();
  }
}; 