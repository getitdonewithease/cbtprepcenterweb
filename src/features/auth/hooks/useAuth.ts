import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { SignInCredentials, SignUpData } from '../types/authTypes';
import { notify } from '@/core/notifications/notify';
import { getAccessToken } from '@/core/auth/tokenStorage';
import { useToast } from '@/components/ui/use-toast';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign in';
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

  const signUp = async (data: SignUpData, confirmPassword: string) => {
    setError('');

    if (data.password !== confirmPassword) {
      const mismatchMessage = 'Passwords do not match';
      setError(mismatchMessage);
      toast({
        title: 'Error',
        description: mismatchMessage,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload: SignUpData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        department: data.department,
        courses: data.courses,
      };

      const response = await authService.handleSignUp(payload);

      toast({
        title: 'Success',
        description: response.message || 'Account created successfully!',
        variant: 'success',
      });

      await signIn({ email: data.email, password: data.password });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMsg);
      toast({
        title: 'Sign Up Error',
        description: errorMsg,
        variant: 'destructive',
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithGoogle = async (idToken: string, accessToken: string, toastFn?: Function) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.handleGoogleSignUp(idToken, accessToken);
      if (toastFn) {
        toastFn({
          title: 'Signed Up',
          description: response.message || 'Account created successfully!',
          variant: 'success',
        });
      }
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
      if (toastFn) {
        toastFn({
          title: 'Sign Up Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError('');
    try {
      await authService.handleLogout();
      notify.success({
        title: 'Signed Out',
        description: 'Logged out successfully',
        duration: 2000,
      });
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

  return {
    isLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signUpWithGoogle,
    signOut,
  };
} 