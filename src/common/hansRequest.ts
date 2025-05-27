import { isErrorResponse } from '@/backend/utils/apiResponse';
import { ApiResponse } from '@/types/api';

type RequestOptions = {
  headers?: HeadersInit
  silent?: boolean // 是否静默处理错误 (不打印日志)
  errorCtx?: string // 自定义控制台报错信息
}

export const hansRequest = {
  async get<T = unknown>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this._request<T>(url, {
      method: 'GET',
      ...(options.headers ? { headers: options.headers } : {}),
    }, options);
  },

  async post<T = unknown>(
    url: string,
    body: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this._request<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...(body && typeof body === 'object' ? { body: JSON.stringify(body) } : {}),
    }, options);
  },

  async _request<T = unknown>(
    url: string,
    init: RequestInit,
    options: RequestOptions = {}
  ): Promise<T> {
    // 区分请求错误（如 HTTP 错误）和业务错误，前者默认 console.error ，后者默认静默
    const json = await this._fetchResponseData<T>(url, init, options);
    if (isErrorResponse(json)) {
      throw new Error(json.msg);
    }
    return json.data;
  },

  async _fetchResponseData<T = unknown>(
    url: string,
    init: RequestInit,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      return json;
    } catch (error) {
      this._handleError(error, options);
      throw error;
    }
  },

  _handleError(error: unknown, options: RequestOptions): void {
    if (options.silent) return;    
    const context = options.errorCtx || '[hansRequest Error]';
    console.error(context, error);
  }
};
