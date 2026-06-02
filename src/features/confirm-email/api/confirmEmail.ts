import api from "@/core/api/httpClient";
import type { ConfirmEmailApiResponse } from "../types";

export async function confirmEmailRequest(token: string) {
  const response = await api.put<ConfirmEmailApiResponse>(
    "/api/v1/auth/emailconfirm",
    {},
    {
      headers: {
        "X-ID-Token": token,
      },
    }
  );
  return response.data;
}
