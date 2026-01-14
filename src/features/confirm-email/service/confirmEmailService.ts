import type { ConfirmEmailResult } from "../types";
import { confirmEmailRequest } from "../api/confirmEmail";

export async function confirmEmailService(token: string): Promise<ConfirmEmailResult> {
  try {
    const data = await confirmEmailRequest(token);

    if (data?.isSuccess) {
      return {
        status: "success",
        message: "Email confirmed successfully.",
        data: data.value ?? undefined,
      };
    }

    const apiMessage = typeof data?.message === "string" && data.message.trim().length > 0
      ? data.message
      : "Unable to confirm email.";

    return { status: "error", message: apiMessage };
  } catch (err: any) {
    // Axios error shape handling
    const status = err?.response?.status as number | undefined;
    const respData = err?.response?.data as { message?: string } | undefined;
    const hasMessage = typeof respData?.message === "string" && respData.message.trim().length > 0;

    if (status && status >= 500) {
      // Show API-provided message if present; otherwise a generic server error
      return {
        status: "error",
        message: hasMessage ? respData!.message! : "Server error. Please try again later.",
      };
    }

    if (status && status >= 400) {
      return {
        status: "error",
        message: hasMessage ? respData!.message! : "Invalid or expired confirmation token.",
      };
    }

    return { status: "error", message: "Network error. Check your connection and try again." };
  }
}
