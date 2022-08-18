import type { AxiosPromise, AxiosResponse } from 'axios'
import type { Ref } from 'vue'
import type { ResponseData } from '../api'

export type Pagination<T> = T & { pageSize: number; pageNum: number }

/**
 * @description usePaginationRequest函数的返回值
 */
export interface PaginationRequestReturn {
  // pagination?: ShallowReactive<{ pageSize: number; pageNum: number }>
  prev: () => number
  next: () => number
  to: (num: number) => number
  pageSize: Ref<number>
  pageNum: Ref<number>
}
export type PaginationRequestReturnRes = Promise<PaginationRequestReturn>

export interface PaginationTool { [index: string]: PaginationRequestReturn }

export type PaginationAxios<Y, T = {}> = (data: Pagination<T>) => AxiosPromise<ResponseData<Y>>

export interface PaginationRequestParams<Y, T> {
  successMessage?: string
  errorMessage?: string
  successCode?: string
  errorCode?: string
  axios?: PaginationAxios<Y, T>
  state?: Ref<Y>
  data?: T
  loadings?: Ref<boolean> | Ref<boolean>[]
  isNull?: boolean
  isMessage?: boolean
  pageSize?: number
  allCount?: Ref<number>
  scheduler?: (res: AxiosResponse<ResponseData<Y>>, refSeta?: Ref<Y>) => void
  page?: Ref<number>
}

export type PaginationAxiosCache = (data: any) => AxiosPromise<ResponseData<any>>
export interface UseCacheRequestParameters {
  key: string
}
