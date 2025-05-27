export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError

export type ApiResponseSuccess<T> = {
  code: 0
  msg: string
  data: T
}

export type ApiResponseError = {
  code: Exclude<number, 0>
  msg: string
  data: null
}
