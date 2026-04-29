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

import axios, { AxiosInstance } from "axios";
import { getAuthService, IAuthService } from "./auth-service";
import { classifyHttpError } from "@/lib/network/http-error";
import { resolveApiBaseUrl, warnIfSuspiciousApiBaseUrl } from "@/lib/network/runtime-config";

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
          const token = await this.authService.getToken({ waitForSession: true });
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
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
        const details = classifyHttpError(error);
        if (details.kind === "network_unreachable") {
          console.error("[HTTP Client Error] Network issue detected", details);
        } else if (details.kind === "auth_unavailable" && details.status === 401) {
          console.debug("[HTTP Client Auth] Token unavailable/expired during request", details);
        } else {
          console.error("[HTTP Client Error]", details);
        }
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
