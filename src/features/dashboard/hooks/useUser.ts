import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../api/dashboardApi";
import { UserProfile } from "../types/dashboardTypes";

/**
 * Hook for fetching user profile only.
 * Used in Layout component to display user info in navbar/sidebar.
 */
export const useUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true);
        const userProfile = await fetchUserProfile();
        setUser(userProfile);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load user profile";
        setUserError(message);
        if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('token')) {
          navigate('/signin');
        }
      } finally {
        setUserLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  return {
    user,
    userLoading,
    userError,
  };
};
