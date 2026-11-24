/** The candidate's own settings, as the settings dialog shows and saves them. */

export interface SettingsProfile {
  firstName: string;
  lastName: string;
  email: string;
  emailConfirmed: boolean;
  /** A picture URL, or "" to show initials. */
  avatar: string;
  department: string;
  /** Four subject codes, "english" first. */
  subjects: string[];
  /** Out of 400; null until set. */
  targetScore: number | null;
}

export type SectionId = "profile" | "subjects" | "goal" | "sign-in";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
