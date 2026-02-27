import { AppError } from "./AppError";
import { AppErrorContext, BackendValidationErrorPayload } from "./types";

export class DomainError extends AppError {
  public readonly details: Record<string, string[]>;

  constructor(
    message: string,
    details: Record<string, string[]>,
    context?: AppErrorContext,
    cause?: unknown,
  ) {
    super(message, "DOMAIN_ERROR", context, cause, "DomainError");
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static fromPayload(payload: BackendValidationErrorPayload, cause?: unknown): DomainError {
    const firstErrorKey = Object.keys(payload.errors)[0];
    const resolvedMessage = firstErrorKey ?? payload.title;

    return new DomainError(
      resolvedMessage,
      payload.errors,
      {
        statusCode: payload.status,
      },
      cause,
    );
  }
}
