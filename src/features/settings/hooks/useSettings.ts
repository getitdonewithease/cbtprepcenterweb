import { useState, useEffect, useCallback } from "react";
import { UserProfile, ApplicationSettings, PasswordState } from "../types/settingsTypes";
import { settingsApi } from "../api/settingsApi";

export const useSettings = () => {
  const [user, setUser] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    selectedSubjects: [],
    avatar: "",
  });

  const [settings, setSettings] = useState<ApplicationSettings>({
    theme: "light",
    profileVisibility: true,
    emailNotifications: true,
    joinLeaderboard: true,
  });

  const [passwords, setPasswords] = useState<PasswordState>({
    current: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await settingsApi.fetchUserProfile();
        setUser(userProfile);
      } catch (err) {
        setError("Failed to fetch student profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = useCallback(async () => {
    try {
      await settingsApi.updateUserProfile(user);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
      console.error(err);
    }
  }, [user]);

  const handlePasswordChange = useCallback(async () => {
    try {
      await settingsApi.changePassword(passwords);
      alert("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      alert(err.message || "Failed to change password.");
      console.error(err);
    }
  }, [passwords]);

  return {
    user,
    setUser,
    settings,
    setSettings,
    passwords,
    setPasswords,
    loading,
    error,
    handleProfileUpdate,
    handlePasswordChange,
  };
}; 