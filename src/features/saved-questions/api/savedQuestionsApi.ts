import api from "@/lib/apiConfig";

/**
 * Fetches the user's saved questions.
 * @returns The list of saved questions.
 */
export const getSavedQuestions = async () => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.get('/api/v1/students/savedquestions/');
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value.savedQuestions;
    } else {
      throw new Error(response.data?.message || "Failed to fetch saved questions");
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to fetch saved questions");
  }
};

/**
 * Removes a question from saved questions.
 * @param questionId - The ID of the question to remove.
 * @returns Success response.
 */
export const removeSavedQuestion = async (questionId: string) => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.delete(`/api/v1/students/savedquestions/${questionId}`);
    if (response.data?.isSuccess) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to remove saved question");
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to remove saved question");
  }
};

/**
 * Saves or updates a note for a question.
 * @param questionId - The ID of the question.
 * @param note - The note content.
 * @returns Success response.
 */
export const saveQuestionNote = async (questionId: string, note: string) => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.put(`/api/v1/students/savedquestions/${questionId}`, { note });
    if (response.data?.isSuccess) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to save note");
    }
  } catch (err: any) {
    // Handle the new error format with errors object
    if (err.response?.data?.errors) {
      const errorMessages = Object.values(err.response.data.errors).flat();
      throw new Error(errorMessages.join('. ') || "Failed to save note");
    }
    throw new Error(err.response?.data?.message || err.message || "Failed to save note");
  }
};

/**
 * Gets the note for a question.
 * @param questionId - The ID of the question.
 * @returns The note content.
 */
export const getQuestionNote = async (questionId: string) => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.get(`/api/v1/students/questions/${questionId}/note`);
    if (response.data?.isSuccess) {
      return response.data.value?.note || "";
    } else {
      return ""; // Return empty string if no note exists
    }
  } catch (err: any) {
    // If note doesn't exist, return empty string instead of error
    if (err.response?.status === 404) {
      return "";
    }
    throw new Error(err.response?.data?.message || err.message || "Failed to get note");
  }
};

/**
 * Deletes a note for a question.
 * @param questionId - The ID of the question.
 * @returns Success response.
 */
export const deleteQuestionNote = async (questionId: string) => {
  try {
    const token = localStorage.getItem("token");
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await api.delete(`/api/v1/students/questions/${questionId}/note`);
    if (response.data?.isSuccess) {
      return response.data;
    } else {
      throw new Error(response.data?.message || "Failed to delete note");
    }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || err.message || "Failed to delete note");
  }
}; 