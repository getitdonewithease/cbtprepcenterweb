export interface ConfirmEmailSuccessValue {
  userId: { value: string };
  studentId: { value: string };
  email: string;
}

export interface ConfirmEmailApiResponse {
  isSuccess: boolean;
  value: ConfirmEmailSuccessValue | null;
  message: string | null;
}

export type ConfirmEmailStatus = "idle" | "loading" | "success" | "error";

export interface ConfirmEmailResult {
  status: ConfirmEmailStatus;
  message: string;
  data?: ConfirmEmailSuccessValue;
}
