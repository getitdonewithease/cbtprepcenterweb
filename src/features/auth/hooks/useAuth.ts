import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { SignInCredentials } from '../types/authTypes';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const signIn = async (credentials: SignInCredentials, toast?: Function) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.handleSignIn(credentials);
      if (toast) {
        toast({
          title: 'Signed In',
          description: response.message || 'Signed in successfully!',
          variant: 'success',
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to sign in';
      setError(errorMsg);
      if (toast) {
        toast({
          title: 'Sign In Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
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