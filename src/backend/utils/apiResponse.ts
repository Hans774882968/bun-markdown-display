import { ApiResponse, ApiResponseError, ApiResponseSuccess } from '@/types/api';

export function successResponse<T>(data: T): ApiResponseSuccess<T> {
  return {
    code: 0,
    msg: '',
    data,
  };
}

export function errorResponse(code: number, msg: string): ApiResponseError {
  return {
    code,
    msg,
    data: null,
  };
}

export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponseError {
  return response.code !== 0;
}
