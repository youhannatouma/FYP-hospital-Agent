import axios, { AxiosError } from "axios";

export type HttpErrorKind =
  | "network_unreachable"
  | "timeout"
  | "http_4xx"
  | "http_5xx"
  | "auth_unavailable"
  | "unknown";

export type HttpErrorDiagnostics = {
  kind: HttpErrorKind;
  message: string;
  status?: number;
  code?: string;
  method?: string;
  url?: string;
  baseURL?: string;
  browserOrigin?: string;
  corsHint?: string;
};

export function classifyHttpError(error: unknown): HttpErrorDiagnostics {
  if (!axios.isAxiosError(error)) {
    return { kind: "unknown", message: "An unexpected error occurred" };
  }

  const err = error as AxiosError<{ message?: string; detail?: string }>;
  const status = err.response?.status;
  const code = err.code;
  const message =
    err.response?.data?.message ||
    err.response?.data?.detail ||
    err.message ||
    "An unexpected error occurred";

  let kind: HttpErrorKind = "unknown";
  if (status === 401 || status === 403) kind = "auth_unavailable";
  else if (status && status >= 400 && status < 500) kind = "http_4xx";
  else if (status && status >= 500) kind = "http_5xx";
  else if (code === "ECONNABORTED" || /timeout/i.test(message)) kind = "timeout";
  else if (!status || err.message === "Network Error") kind = "network_unreachable";

  let corsHint: string | undefined;
  if (!status || err.message === "Network Error") {
    corsHint =
      "Check backend availability, CORS_ORIGINS, and NEXT_PUBLIC_API_URL host/port alignment.";
  }

  return {
    kind,
    message,
    status,
    code,
    method: err.config?.method?.toUpperCase(),
    url: err.config?.url,
    baseURL: err.config?.baseURL,
    browserOrigin:
      typeof globalThis.window !== "undefined" ? globalThis.window.location.origin : undefined,
    corsHint,
  };
}
