import api from "@/lib/apiConfig";
import { UserProfile } from "../types/settingsTypes";

export const settingsApi = {
  async fetchUserProfile(): Promise<UserProfile> {
    const token = localStorage.getItem("token");
    const res = await api.get("/api/v1/students/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data.value;
    if (!data) {
      throw new Error("Failed to fetch student profile");
    }

    let selectedSubjects = Array.isArray(data.courses)
      ? data.courses.map((c: string) => c.toLowerCase())
      : [];

    if (!selectedSubjects.includes("english")) {
      selectedSubjects = ["english", ...selectedSubjects];
    }
    if (selectedSubjects.length > 4) {
      selectedSubjects = selectedSubjects.slice(0, 4);
    }

    return {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      department: data.department || "",
      selectedSubjects,
      avatar: data.avatar || "",
      emailConfirmed: !!data.emailConfirmed,
    };
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const token = localStorage.getItem("token");
    await api.put(
      "/api/v1/students",
      {
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department,
        courses: profile.selectedSubjects?.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        avatar: profile.avatar,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  async changePassword(passwordData: { current: string; new: string; confirm: string }): Promise<{ isSuccess: boolean; message: string }> {
    const token = localStorage.getItem("token");
    if (passwordData.new !== passwordData.confirm) {
      throw new Error("New passwords do not match!");
    }
    const res = await api.put(
      "/api/v1/password/reset",
      {
        oldPassword: passwordData.current,
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.data.isSuccess) {
      throw new Error(res.data.message || "Failed to reset password");
    }
    return { isSuccess: res.data.isSuccess, message: res.data.message };
  },

  async confirmEmail(): Promise<{ isSuccess: boolean; message: string | null }> {
    const token = localStorage.getItem("token");
    const res = await api.get("/api/v1/emailconfirm", {
    });
    return { isSuccess: res.data.isSuccess, message: res.data.message };
  }
}; 