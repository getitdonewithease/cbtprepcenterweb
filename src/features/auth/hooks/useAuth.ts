import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { SignInCredentials } from '../types/authTypes';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const signIn = async (credentials: SignInCredentials) => {
    setError('');
    setIsLoading(true);
    try {
      await authService.handleSignIn(credentials);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authService.handleGoogleSignIn();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    signIn,
    signInWithGoogle
  };
} 