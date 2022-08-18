import axios from 'axios'
import { axiosExceptionHandling } from '../request'

const ruoyiRequest = axios.create({
  // baseURL: 'http://127.0.0.1:4523/mock/687420',
  baseURL: '/api',
})

ruoyiRequest.interceptors.request.use((config) => {
  const userInfo: any | null = JSON.parse(window.localStorage.getItem('userInfo') as string)
  if (config.headers && userInfo)
    config.headers.token = userInfo.token

  return config
})

ruoyiRequest.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
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
export default ruoyiRequest
