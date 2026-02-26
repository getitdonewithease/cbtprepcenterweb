import { useState, useEffect, useCallback } from "react";
import { UserProfile, ApplicationSettings, PasswordState } from "../types/settingsTypes";
import { settingsApi } from "../api/settingsApi";
import { notify } from "@/lib/notify";
import { DomainError, getErrorMessage } from "@/core/errors";

export const useSettings = () => {
  const resolveDomainNotification = (error: unknown): { title: string; description: string } => {
    if (error instanceof DomainError) {
      const firstKey = Object.keys(error.details)[0];
      const firstMessage = firstKey ? error.details[firstKey]?.[0] : undefined;

      return {
        title: firstKey ?? "Error",
        description: firstMessage ?? error.message,
      };
    }

    return {
      title: "Error",
      description: getErrorMessage(error, "Request failed."),
    };
  };

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
    } catch (err: unknown) {
      const notification = resolveDomainNotification(err);
      notify.error({
        title: notification.title,
        description: notification.description || "Failed to change password.",
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
    } catch (err: unknown) {
      const notification = resolveDomainNotification(err);
      notify.error({
        title: notification.title,
        description: notification.description || "Failed to send confirmation email.",
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