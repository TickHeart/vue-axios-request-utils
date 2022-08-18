import type { Ref } from 'vue'
import type { AxiosPromise, AxiosResponse } from 'axios'
import type { ResponseData } from '../api'
import type { UseCacheRequestParameters } from './requestHooks'

export interface axiosOptions {
  axios?: UseCacheRequestParameters
}

export interface UseLoadingRequestParameters<T> extends UseIsNullRequestParameters<T> {
  loadings?: Ref<boolean> | Ref<boolean>[]
  scheduler?: (res: AxiosResponse<ResponseData<T>, any>, refSeta?: Ref<T>) => any
}

export interface UseIsNullRequestParameters<T> {
  state?: Ref<T>
  axios: AxiosPromise<ResponseData<T>>
  key?: string
}

export interface UseMessageRequest<T> extends UseLoadingRequestParameters<T> {
  successMessage?: string
  errorMessage?: string
  successCode?: string | number
  errorCode?: string | number
}

export interface UseOptionsRequestParameters<T> {
  axios?: AxiosPromise<ResponseData<T>>
  scheduler?: (res: AxiosResponse<ResponseData<T>, any>, refSeta?: Ref<any>) => void
}
