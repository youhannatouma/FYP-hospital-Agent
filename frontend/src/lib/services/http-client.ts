/**
 * HTTP Client Interface
 * Abstracts HTTP implementation (axios, fetch, etc.)
 * Depends on IAuthService (DIP)
 * Open for extension, closed for modification (OCP)
 */

export interface RequestConfig {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
}

export interface HttpResponse<T = any> {
  status: number;
  data: T;
  headers?: Record<string, any>;
}

export interface IHttpClient {
  get<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
  delete<T = any>(
    url: string,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>>;
}

import axios, { AxiosInstance } from "axios";
import { IAuthService } from "./auth-service";

export class AxiosHttpClient implements IHttpClient {
  private client: AxiosInstance;

  constructor(
    private authService: IAuthService,
    baseURL: string = process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000/api",
  ) {
    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });

    // Request interceptor: attach token automatically
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.authService.getToken();
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
        const message =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "An unexpected error occurred";
        console.error("[HTTP Client Error]", message);
        return Promise.reject(error);
      },
    );
  }

  async get<T = any>(
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

  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.post(url, data, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.put(url, data, config);
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  }

  async delete<T = any>(
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
    const { getAuthService } = require("./auth-service");
    httpClientInstance = new AxiosHttpClient(authService || getAuthService());
  }
  return httpClientInstance;
}

export function setHttpClient(client: IHttpClient): void {
  httpClientInstance = client;
}
