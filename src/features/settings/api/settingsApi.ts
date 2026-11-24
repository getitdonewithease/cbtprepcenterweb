import api from "@/core/api/httpClient";
import type { SettingsProfile } from "../types/settingsTypes";

/** HTTP only: read the student's profile; save profile, subjects, target and password. */

export const settingsApi = {
  async fetchProfile(): Promise<SettingsProfile> {
    const res = await api.get("/api/v1/students/me");
    const data = res.data?.value;
    if (!data) throw new Error("Failed to fetch student profile");
    return {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      emailConfirmed: Boolean(data.emailConfirmed),
      avatar: data.avatar || "",
      department: data.department || "",
      subjects: Array.isArray(data.courses) ? data.courses.map((c: string) => c.toLowerCase().trim()) : [],
      targetScore: typeof data.targetScore === "number" ? data.targetScore : null,
    };
  },

  /** The API saves name, department, subjects and photo together. */
  async updateProfile(profile: Pick<SettingsProfile, "firstName" | "lastName" | "department" | "subjects" | "avatar">): Promise<void> {
    await api.put("/api/v1/students", {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      department: profile.department,
      courses: profile.subjects.map((s) => s.toLowerCase().trim()),
      avatar: profile.avatar,
    });
  },

  async updateTargetScore(targetScore: number): Promise<void> {
    await api.put("/api/v1/students/me/target-score", { targetScore });
  },

  async changePassword(current: string, next: string): Promise<void> {
    const res = await api.put("/api/v1/auth/update-password", {
      oldPassword: current,
      newPassword: next,
      confirmPassword: next,
    });
    if (!res.data?.isSuccess) throw new Error(res.data?.message || "Failed to change password");
  },

  /** Sends the candidate a link to confirm their email address. */
  async sendEmailConfirmation(): Promise<void> {
    const res = await api.get("/api/v1/auth/emailconfirm");
    if (!res.data?.isSuccess) throw new Error(res.data?.message || "Failed to send confirmation email");
  },
};
