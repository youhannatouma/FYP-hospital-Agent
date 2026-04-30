/**
 * HTTP Client Interface
 * Abstracts HTTP implementation (axios, fetch, etc.)
 * Depends on IAuthService (DIP)
 * Open for extension, closed for modification (OCP)
 */

export interface RequestConfig {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, unknown>;
}

export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  headers?: Record<string, unknown>;
}

export interface IHttpClient {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
  delete<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
}

import axios, { AxiosHeaders, AxiosInstance } from "axios";
import { getAuthService, IAuthService } from "./auth-service";
import { attachHttpErrorDiagnostics } from "@/lib/network/http-error";
import { resolveApiBaseUrl, warnIfSuspiciousApiBaseUrl } from "@/lib/network/runtime-config";

type HeaderAccessor = {
  get?: (name: string) => unknown;
  has?: (name: string) => boolean;
  set?: (name: string, value: string) => void;
  Authorization?: unknown;
  authorization?: unknown;
};

function hasAuthorizationHeader(headers: unknown): boolean {
  if (!headers || typeof headers !== "object") return false;

  const headerAccessor = headers as HeaderAccessor;
  if (typeof headerAccessor.has === "function" && headerAccessor.has("Authorization")) {
    return true;
  }
  if (typeof headerAccessor.get === "function" && headerAccessor.get("Authorization")) {
    return true;
  }

  return Boolean(headerAccessor.Authorization || headerAccessor.authorization);
}

function setAuthorizationHeader(headers: unknown, token: string): void {
  if (!headers || typeof headers !== "object") return;

  const headerAccessor = headers as HeaderAccessor;
  const authorization = `Bearer ${token}`;
  if (typeof headerAccessor.set === "function") {
    headerAccessor.set("Authorization", authorization);
    return;
  }

  headerAccessor.Authorization = authorization;
}

function ensureHeaders(headers: unknown): AxiosHeaders {
  if (headers instanceof AxiosHeaders) return headers;
  if (!headers || typeof headers !== "object") return new AxiosHeaders();
  return AxiosHeaders.from(headers as Record<string, string>);
}

export class AxiosHttpClient implements IHttpClient {
  private client: AxiosInstance;

  constructor(
    private authService: IAuthService,
    baseURL: string = resolveApiBaseUrl(),
  ) {
    warnIfSuspiciousApiBaseUrl(baseURL);
    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });

    // Request interceptor: attach token automatically
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const headers = ensureHeaders(config.headers);
          config.headers = headers;

          if (!hasAuthorizationHeader(headers)) {
            const token = await this.authService.getToken({ waitForSession: true });
            if (token) {
              setAuthorizationHeader(headers, token);
            }
          }
        } catch {
          // Continue without token
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor: standardized error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        attachHttpErrorDiagnostics(error);
        return Promise.reject(error);
      },
    );
  }

  async get<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.get(url, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.post(url, data, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.put(url, data, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }

  async delete<T = unknown>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.delete(url, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }
}

// Singleton instance
let httpClientInstance: IHttpClient | null = null;

export function getHttpClient(authService?: IAuthService): IHttpClient {
  if (!httpClientInstance) {
    httpClientInstance = new AxiosHttpClient(authService || getAuthService());
  }
  return httpClientInstance;
}

export function setHttpClient(client: IHttpClient): void {
  httpClientInstance = client;
}
