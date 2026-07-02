import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { SignInCredentials, SignUpData } from '../types/authTypes';
import { notify } from '@/core/notifications/notify';
import { getAccessToken } from '@/core/auth/tokenStorage';

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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData, confirmPassword: string) => {
    setError('');

    if (data.password !== confirmPassword) {
      const mismatchMessage = 'Passwords do not match';
      setError(mismatchMessage);
      return;
    }

    setIsLoading(true);
    try {
      const payload: SignUpData = {
        ...data,
      };

      await authService.handleSignUp(payload);
      await signIn({ email: data.email, password: data.password });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMsg);
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithGoogle = async (idToken: string, accessToken: string) => {
    setError('');
    setIsLoading(true);
    try {
      await authService.handleGoogleSignUp(idToken, accessToken);
      setError('');
      // If token is available, navigate to dashboard; otherwise, might need additional setup
      const token = getAccessToken();
      if (token) {
        navigate('/dashboard');
      } else {
        // If no token, redirect to sign in or show a message
        navigate('/signin');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign up with Google';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError('');
    try {
      await authService.handleLogout();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      notify.error({
        title: 'Sign Out Error',
        description: message,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
      navigate('/signin');
    }
  };

  const forgotPassword = async (registeredEmail: string): Promise<boolean> => {
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.handleForgotPassword(registeredEmail);
      if (result.isValidationError) {
        setError(result.message || 'Please enter a valid email address.');
        return false;
      }

      notify.success({
        title: 'Request Received',
        description: 'If an account exists for this email, a reset link has been sent.',
        duration: 5000,
      });
      return true;
    } catch {
      // Safety fallback: avoid account-enumeration hints for unexpected failures.
      notify.success({
        title: 'Request Received',
        description: 'If an account exists for this email, a reset link has been sent.',
        duration: 5000,
      });
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
    forgotPassword,
  };
} 
