import { AppError } from "./AppError";
import { DomainError } from "./DomainError";

export const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof DomainError) {
    const firstDetailKey = Object.keys(error.details)[0];
    return firstDetailKey ?? error.message ?? fallbackMessage;
  }

  if (error instanceof AppError) {
    return error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const hasErrorStatusCode = (error: unknown, statusCode: number): boolean => {
  return error instanceof AppError && error.context?.statusCode === statusCode;
};
