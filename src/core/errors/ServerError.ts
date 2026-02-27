import { AppError } from "./AppError";
import { AppErrorContext, BackendServerErrorPayload } from "./types";

export class ServerError extends AppError {
  constructor(message: string, context?: AppErrorContext, cause?: unknown) {
    super(message, "SERVER_ERROR", context, cause, "ServerError");

    Object.setPrototypeOf(this, new.target.prototype);
  }

  static fromPayload(payload: BackendServerErrorPayload, cause?: unknown): ServerError {
    return new ServerError(payload.detail || payload.title, {
      statusCode: payload.status,
      path: payload.instance,
    }, cause);
  }
}
