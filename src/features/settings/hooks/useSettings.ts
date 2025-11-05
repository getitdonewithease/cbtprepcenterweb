import { useState, useEffect, useCallback } from "react";
import { UserProfile, ApplicationSettings, PasswordState } from "../types/settingsTypes";
import { settingsApi } from "../api/settingsApi";
import { notify } from "@/lib/notify";

export const useSettings = () => {
  const [user, setUser] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    selectedSubjects: [],
    avatar: "",
    emailConfirmed: false,
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
      const res = await settingsApi.changePassword(passwords);
      notify.success({
        title: "Success",
        description: res.message || "Password changed successfully!",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      let errorTitle = "Error";
      let errorMsg = err.message || "Failed to change password.";
      if (err.response && err.response.data && err.response.data.errors) {
        const errorsObj = err.response.data.errors;
        const firstKey = Object.keys(errorsObj)[0];
        if (firstKey && Array.isArray(errorsObj[firstKey]) && errorsObj[firstKey].length > 0) {
          errorTitle = firstKey;
          errorMsg = errorsObj[firstKey][0];
        }
      }
      notify.error({
        title: errorTitle,
        description: errorMsg,
      });
      console.error(err);
    }
  }, [passwords]);

  const handleConfirmEmail = useCallback(async () => {
    try {
      const res = await settingsApi.confirmEmail();
      if (res.isSuccess) {
        notify.success({
          title: "Success",
          description: res.message || "Email confirmation sent!",
        });
      } else {
        notify.error({
          title: "Error",
          description: res.message || "Failed to send confirmation email.",
        });
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errorsObj = err.response.data.errors;
        const firstKey = Object.keys(errorsObj)[0];
        if (firstKey && Array.isArray(errorsObj[firstKey]) && errorsObj[firstKey].length > 0) {
          notify.error({
            title: firstKey,
            description: errorsObj[firstKey][0],
          });
          console.error(err);
          return;
        }
      }
      notify.error({
        title: "Error",
        description: err.message || "Failed to send confirmation email.",
      });
      console.error(err);
    }
  }, []);

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
    handleConfirmEmail,
  };
}; 