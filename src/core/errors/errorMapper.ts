import { AxiosError } from "axios";
import { AppError } from "./AppError";
import { DomainError } from "./DomainError";
import { ServerError } from "./ServerError";
import { BackendServerErrorPayload, BackendValidationErrorPayload } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

const isValidationErrorsMap = (value: unknown): value is Record<string, string[]> => {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((entry) => isStringArray(entry));
};

const hasString = (value: unknown): value is string => typeof value === "string";
const hasNumber = (value: unknown): value is number => typeof value === "number";

export const isBackendValidationErrorPayload = (
  payload: unknown,
): payload is BackendValidationErrorPayload => {
  if (!isRecord(payload)) {
    return false;
  }

  return (
    hasString(payload.type) &&
    hasString(payload.title) &&
    hasNumber(payload.status) &&
    isValidationErrorsMap(payload.errors) &&
    (payload.traceId === undefined || hasString(payload.traceId))
  );
};

export const isBackendServerErrorPayload = (
  payload: unknown,
): payload is BackendServerErrorPayload => {
  if (!isRecord(payload)) {
    return false;
  }

  return (
    hasString(payload.title) &&
    hasNumber(payload.status) &&
    hasString(payload.detail) &&
    hasString(payload.instance)
  );
};

export const mapAxiosErrorToAppError = (error: AxiosError): AppError => {
  if (!error.response) {
    return new ServerError("Network error. Please check your internet connection.", undefined, error);
  }

  const statusCode = error.response.status;
  const payload = error.response.data;
  const responsePath = error.config?.url;

  if (isBackendValidationErrorPayload(payload)) {
    const mappedError = DomainError.fromPayload(payload, error);

    return new DomainError(
      mappedError.message,
      mappedError.details,
      {
        ...mappedError.context,
        path: responsePath,
      },
      error,
    );
  }

  if (isBackendServerErrorPayload(payload)) {
    const mappedError = ServerError.fromPayload(payload, error);

    return new ServerError(
      mappedError.message,
      {
        ...mappedError.context,
        path: mappedError.context?.path ?? responsePath,
      },
      error,
    );
  }

  const fallbackMessage =
    typeof error.message === "string" && error.message.trim().length > 0
      ? error.message
      : "Unexpected server error occurred.";

  return new ServerError(
    fallbackMessage,
    {
      statusCode,
      path: responsePath,
    },
    error,
  );
};
