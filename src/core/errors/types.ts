export interface BackendValidationErrorPayload {
  type: string;
  title: string;
  status: number;
  errors: Record<string, string[]>;
  traceId?: string;
}

export interface BackendServerErrorPayload {
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export interface AppErrorContext {
  statusCode?: number;
  path?: string;
}
