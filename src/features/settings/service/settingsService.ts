import { DomainError } from "@/core/errors";
import { COMPULSORY_SUBJECT, departmentSubjects } from "@/features/exams";
import { settingsApi } from "../api/settingsApi";
import type { SettingsProfile } from "../types/settingsTypes";

/**
 * The settings rules: what may be saved, and the words a candidate sees when it can't.
 * Backend messages are never shown as they come (they can carry field keys).
 */

export const SUBJECT_COUNT = 4;
export const TARGET_MIN = 100;
export const TARGET_MAX = 400;

/** English first, unknown or duplicate codes dropped, at most four. */
export const normaliseSubjects = (subjects: string[]) => {
  const unique = [...new Set(subjects.map((s) => s.toLowerCase().trim()).filter(Boolean))];
  const rest = unique.filter((s) => s !== COMPULSORY_SUBJECT);
  return [COMPULSORY_SUBJECT, ...rest].slice(0, SUBJECT_COUNT);
};

/** The subjects a department offers; every subject if the department is unknown. */
export const subjectsForDepartment = (department: string) => departmentSubjects[department] ?? Object.values(departmentSubjects).flat();

/** Keeps the chosen subjects the new department offers (English always stays). */
export const subjectsAfterDepartmentChange = (subjects: string[], department: string) => {
  const offered = subjectsForDepartment(department);
  return normaliseSubjects(subjects.filter((s) => s === COMPULSORY_SUBJECT || offered.includes(s)));
};

export const nameError = (firstName: string) => (firstName.trim() ? null : "Enter your first name.");

export const subjectsError = (subjects: string[]) => {
  const missing = SUBJECT_COUNT - normaliseSubjects(subjects).length;
  return missing > 0 ? `Choose ${missing} more ${missing === 1 ? "subject" : "subjects"}.` : null;
};

export const targetError = (value: string) => {
  const n = Number(value);
  if (!value.trim() || !Number.isInteger(n)) return "Enter a whole number.";
  if (n < TARGET_MIN || n > TARGET_MAX) return `Choose a target between ${TARGET_MIN} and ${TARGET_MAX}.`;
  return null;
};

export const passwordError = (current: string, next: string, repeat: string) => {
  if (!current) return "Enter your current password.";
  if (next.length < 8) return "Your new password needs at least 8 characters.";
  if (next !== repeat) return "The two new passwords don't match.";
  if (next === current) return "Choose a password different from your current one.";
  return null;
};

/** A backend validation message (e.g. "Password must contain a digit") is fine to show; a field key isn't. */
export const friendlyError = (error: unknown, fallback: string) => {
  if (error instanceof DomainError) {
    const first = Object.values(error.details)[0]?.[0];
    if (first) return first;
  }
  return fallback;
};

export const settingsService = {
  getProfile: () => settingsApi.fetchProfile(),
  saveProfile: (profile: SettingsProfile) =>
    settingsApi.updateProfile({ ...profile, subjects: normaliseSubjects(profile.subjects) }),
  saveTargetScore: (target: number) => settingsApi.updateTargetScore(target),
  changePassword: (current: string, next: string) => settingsApi.changePassword(current, next),
  sendEmailConfirmation: () => settingsApi.sendEmailConfirmation(),
};
