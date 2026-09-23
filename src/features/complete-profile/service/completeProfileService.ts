import { completeProfileApi } from "../api/completeProfileApi";
import { CompleteProfileFormState, StudentMeData } from "../types/completeProfileTypes";
import { getErrorMessage } from "@/core/errors";

const REQUIRED_SUBJECT_COUNT = 4;
const COMPULSORY_SUBJECT = "english";

export const completeProfileService = {
  async loadInitialProfile(): Promise<StudentMeData | null> {
    try {
      const response = await completeProfileApi.fetchStudentProfile();
      return response.value || null;
    } catch (err) {
      console.warn("Could not pre-fetch student profile:", getErrorMessage(err, "Failed to load profile"));
      return null;
    }
  },

  validateProfile(form: CompleteProfileFormState): string | null {
    if (!form.firstName.trim()) {
      return "Please enter your first name.";
    }

    if (!form.department.trim()) {
      return "Please select your department (e.g. Science, Commercial, or Art).";
    }

    if (form.selectedSubjects.length !== REQUIRED_SUBJECT_COUNT) {
      return `Please select exactly ${REQUIRED_SUBJECT_COUNT} subjects. You currently have ${form.selectedSubjects.length} selected.`;
    }

    if (!form.selectedSubjects.map(s => s.toLowerCase()).includes(COMPULSORY_SUBJECT)) {
      return "English is compulsory and must be included in your subjects.";
    }

    return null;
  },

  async completeProfile(form: CompleteProfileFormState): Promise<void> {
    const validationError = this.validateProfile(form);
    if (validationError) {
      throw new Error(validationError);
    }

    // Ensure English is present and subjects are uniquely formatted with capitalized first letter
    const formattedCourses = form.selectedSubjects.map(
      s => s.charAt(0).toUpperCase() + s.slice(1)
    );

    try {
      await completeProfileApi.updateStudentProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        department: form.department,
        courses: formattedCourses,
        avatar: form.avatar || "",
      });
    } catch (err) {
      const message = getErrorMessage(err, "Failed to complete your profile. Please try again.");
      throw new Error(message);
    }
  },
};
