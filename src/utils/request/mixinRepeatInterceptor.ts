import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { axiosExceptionHandling } from '.'

function generateReqKey(config: AxiosRequestConfig<any>) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('__')
}

const pendingRequest = new Map()

function addPendingRequest(config: AxiosRequestConfig<any>) {
  const requestKey = generateReqKey(config)

  config.cancelToken
    = config.cancelToken
    || new axios.CancelToken((cancel) => {
      if (!pendingRequest.has(requestKey))
        pendingRequest.set(requestKey, cancel)
    })
}
function removePendingRequest(config: AxiosRequestConfig<any>) {
  const requestKey = generateReqKey(config)
  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey)
    cancelToken(requestKey)
    pendingRequest.delete(requestKey)
  }
}

function mixinRepeatInterceptor(req: AxiosInstance) {
  req.interceptors.request.use((config) => {
    const userInfo: any | null = JSON.parse(window.localStorage.getItem('userInfo') as string)
    if (config.headers && userInfo)
      config.headers.token = userInfo.token

    removePendingRequest(config)
    addPendingRequest(config)
    return config
  })
  req.interceptors.response.use(
    (response) => {
      removePendingRequest(response.config)

      return response
    },
    (error) => {
      removePendingRequest(error.config || {})
      // eslint-disable-next-line no-empty
      if (axios.isCancel(error)) {

      }
      else {
        // 添加异常处理
        axiosExceptionHandling(error)
      }
      return error
    },
  )
}

export default mixinRepeatInterceptor
