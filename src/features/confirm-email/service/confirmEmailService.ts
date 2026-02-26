import type { ConfirmEmailResult } from "../types";
import { confirmEmailRequest } from "../api/confirmEmail";
import { AppError, getErrorMessage } from "@/core/errors";

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
  } catch (error: unknown) {
    const status = error instanceof AppError ? error.context?.statusCode : undefined;
    const message = getErrorMessage(error, "Network error. Check your connection and try again.");

    if (status && status >= 500) {
      return {
        status: "error",
        message: message || "Server error. Please try again later.",
      };
    }

    if (status && status >= 400) {
      return {
        status: "error",
        message: message || "Invalid or expired confirmation token.",
      };
    }

    return { status: "error", message };
  }
}
