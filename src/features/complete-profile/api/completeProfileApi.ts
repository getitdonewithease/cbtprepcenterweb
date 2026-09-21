import api from "@/core/api/httpClient";
import { CompleteProfilePayload, StudentMeResponse } from "../types/completeProfileTypes";

export const completeProfileApi = {
  async fetchStudentProfile(): Promise<StudentMeResponse> {
    const res = await api.get<StudentMeResponse>("/api/v1/students/me");
    return res.data;
  },

  async updateStudentProfile(payload: CompleteProfilePayload): Promise<void> {
    await api.put("/api/v1/students", payload);
  },
};
