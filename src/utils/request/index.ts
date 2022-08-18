import type { AxiosPromise, Method } from 'axios'
import axios from 'axios'
import { routerPush } from '../tools'
import mixinRepeatInterceptor from './mixinRepeatInterceptor'

const request = axios.create({
  // baseURL: 'http://127.0.0.1:4523/mock/687420',
  baseURL: '/api/dataProcess',
})
export const baseRequest = <T, R>(
  data: T,
  opt?: { outParams?: string[]; url?: string; method?: Method },
): AxiosPromise<R> => {
  let outParams: string[] = []
  let url = '/'
  if (opt && opt.outParams && opt.outParams.length > 0)
    outParams = opt.outParams

  if (opt && opt.url && opt.url.length > 0)
    url = opt.url

  const { method } = opt || {}
  // deleteObjectKeyByNull(data as any)
  return request({
    url,
    method: method || 'POST',
    data: {
      inParams: data,
      outParams,
    },
  })
}

export const axiosExceptionHandling = (error: any) => {
  const errorCode = error.response.status
  if (errorCode === 401) {
    window.localStorage.removeItem('userInfo')
    routerPush({
      name: 'Login',
    })
  }
  // else if (errorCode === 500) {
  // }
}
mixinRepeatInterceptor(request)
export default request
