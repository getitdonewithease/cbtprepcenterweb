import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { SignInCredentials } from '../types/authTypes';
import { notify } from '@/lib/notify';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const signIn = async (credentials: SignInCredentials) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.handleSignIn(credentials);
      notify.success({
        title: 'Signed In',
        description: response.message || 'Signed in successfully!',
        duration: 2000,
      });
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to sign in';
      setError(errorMsg);
      notify.error({
        title: 'Sign In Error',
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (idToken: string, accessToken: string) => {
    setError('');
    setIsLoading(true);
    try {
      await authService.handleGoogleSignIn(idToken, accessToken);
      setError('');
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