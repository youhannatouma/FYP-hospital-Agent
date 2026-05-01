// @ts-nocheck
/**
 * API Request Helpers
 * Centralizes common request patterns and token handling
 * Follows: Single Responsibility Principle (SRP)
 * Follows: DRY (Don't Repeat Yourself)
 */

import { IHttpClient } from './http-client';
import { RequestConfig } from './http-client';

export class ApiRequestHelper {
  constructor(private httpClient: IHttpClient) {}

  /**
   * Make a GET request with optional auth
   */
  async get<T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.httpClient.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request with optional auth
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.httpClient.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request with optional auth
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.httpClient.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request with optional auth
   */
  async delete<T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.httpClient.delete<T>(url, config);
    return response.data;
  }

  /**
   * Make a PUT request with optional auth
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.httpClient.put<T>(url, data, config);
    return response.data;
  }
}

let apiHelperInstance: ApiRequestHelper | null = null;

export function getApiRequestHelper(httpClient?: IHttpClient): ApiRequestHelper {
  if (!apiHelperInstance) {
    apiHelperInstance = new ApiRequestHelper(httpClient || getHttpClient());
  }
  return apiHelperInstance;
}

export function setApiRequestHelper(helper: ApiRequestHelper): void {
  apiHelperInstance = helper;
}
