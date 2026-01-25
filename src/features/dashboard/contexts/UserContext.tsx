import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../api/dashboardApi';
import { UserProfile } from '../types/dashboardTypes';

interface UserContextValue {
  user: UserProfile | null;
  userLoading: boolean;
  userError: string;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');
  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      setUserLoading(true);
      setUserError('');
      const userProfile = await fetchUserProfile();
      setUser(userProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load user profile';
      setUserError(message);
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('token')) {
        navigate('/signin');
      }
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        userLoading,
        userError,
        refetchUser: loadUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
