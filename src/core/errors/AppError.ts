import { AppErrorContext } from "./types";

export class AppError extends Error {
  public readonly name: string;
  public readonly code: string;
  public readonly context?: AppErrorContext;
  public readonly cause?: unknown;

  constructor(
    message: string,
    code: string,
    context?: AppErrorContext,
    cause?: unknown,
    name = "AppError",
  ) {
    super(message);
    this.name = name;
    this.code = code;
    this.context = context;
    this.cause = cause;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
