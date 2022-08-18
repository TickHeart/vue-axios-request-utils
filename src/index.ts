import type { AxiosResponse } from 'axios'
import { useWebSocket } from '@vueuse/core'
import type { Ref } from 'vue'
import { computed, shallowReactive, toRefs, watch } from 'vue'
import { isArray, noop } from 'ztshared'
import type { ResponseData } from './interfaces/api'
import type {
  UseIsNullRequestParameters,
  UseLoadingRequestParameters,
  UseMessageRequest,
} from './interfaces/hooks/index'
import type {
  PaginationRequestParams,
  PaginationRequestReturn,
} from './interfaces/hooks/requestHooks'
import { tryOnScopeDispose } from './utils/tools'

async function useIsNullRequest<T>(this: any, {
  axios,
  state,
}: UseIsNullRequestParameters<T>) {
  const res = await axios
  const response = (isArray(res.data.data) ? res.data.data : Object.keys(res.data.data)) as
    | string[]
    | any[]
  if (response.length === 0)
    this.info('您搜索的数据好像一条都没有诶～')

  if (state && res.data)
    state.value = res.data.data

  return res
}

const setArrayValue = (arr: Ref<Boolean>[], value: boolean) =>
  arr.forEach(item => (item.value = value))

const useLoadingRequest = async <T>({
  state,
  axios,
  loadings = [],
  scheduler,
}: UseLoadingRequestParameters<T>) => {
  const loadingStates: Ref<boolean>[] = Array.isArray(loadings) ? loadings : [loadings]
  setArrayValue(loadingStates, true)
  const res = await axios

  if (!!scheduler && scheduler !== noop)
    scheduler(res, state)

  else if ((!scheduler || scheduler === noop) && state && res.data)
    state.value = res.data.data

  setArrayValue(loadingStates, false)

  return res
}

async function useLoadingRequestOrIsNull <T>(this: any, {
  state,
  axios,
  loadings,
  scheduler,
}: UseLoadingRequestParameters<T>) {
  const res = await useLoadingRequest({
    axios,
    state,
    loadings,
    scheduler,
  })
  if (!res.data.data)
    return res
  const dara = res.data.data
  const response = (isArray(dara || []) ? dara : Object.keys(dara)) as string[] | T[]
  if (response.length === 0)
    this.info('您搜索的数据好像一条都没有诶～')

  return res
}

type RequestTools =
  | typeof useLoadingRequest
  | typeof useLoadingRequestOrIsNull
  | typeof useMessageRequest

const patchRequest = (isNull: boolean | undefined, isMessage: boolean | undefined) => {
  let su: RequestTools | null = null
  if (isNull)
    su = useLoadingRequestOrIsNull

  else if (!isNull && isMessage)
    su = useMessageRequest

  else
    su = useLoadingRequest

  return su
}

/**
 * @author: 吴宏彬
 * @description: 使用具有分页功能的接口时调用的函数
 * @param {PaginationAxios<Y, T>} options.axios 封装好的axios请求函数
 * @param {Ref<Y>} options.state 要赋值的变量
 * @param {T} options.data 封装好的axios请求函数的参数
 * @param {Ref<boolean> | Ref<boolean>[]} [options.loadings] ref设置的关于按钮loading的变量
 * @param {boolean} [options.isNull] 请求完成后自动判断数据是否为kong并作出提示
 * @param {boolean} [options.pageSize] 每页的个数
 * @return {PaginationRequestReturn} prev 返回上一页 next 前往下一页 to 前往指定页
 */
const usePaginationRequest = <Y, T = {}>({
  data,
  axios,
  state,
  loadings,
  isNull,
  pageSize = 10,
  isMessage,
  allCount,
  successMessage,
  errorMessage,
  successCode = '200',
  errorCode = '400',
  scheduler = noop,
  page,
}: PaginationRequestParams<Y, T>): PaginationRequestReturn => {
  const pagination = shallowReactive({
    pageSize,
    pageNum: 1,
  })
  const _data = computed(() => {
    if (!data)
      data = {} as T

    return {
      ...data,
      pageSize: pagination.pageSize,
      pageNum: pagination.pageNum,
    }
  })
  const su = patchRequest(isNull, isMessage)
  const stopWatch = watch(
    pagination,
    async () => {
      if (!axios || !su)
        return
      if (page)
        page.value = _data.value.pageNum

      const res: AxiosResponse<ResponseData<Y | Y[]>> = (await su({
        axios: axios(_data.value),
        state,
        loadings: loadings || [],
        scheduler,
        successMessage,
        errorMessage,
        successCode,
        errorCode,
      })) as AxiosResponse<ResponseData<Y | Y[]>>
      if (allCount && res && res.data && res.data.total)
        allCount.value = res.data.total
    },
    { immediate: true },
  )

  tryOnScopeDispose(() => {
    stopWatch()
  })
  return {
    prev: () => (pagination.pageNum -= 1),
    next: () => (pagination.pageNum += 1),
    to: (num: number) => {
      return (pagination.pageNum = num)
    },
    ...toRefs(pagination),
  }
}

const useAddPagination = (
  key: string,
  pagination: Map<string, PaginationRequestReturn>,
  value: PaginationRequestReturn,
) => {
  pagination.set(key, value)
}

async function useMessageRequest <T>(this: any, {
  state,
  axios,
  loadings = [],
  successMessage,
  errorMessage,
  successCode = 0,
  errorCode = 500,
  scheduler,
}: UseMessageRequest<T>) {
  try {
    const res = await useLoadingRequest({ state, axios, loadings, scheduler })
    if (successCode === res.data.code)
      this.success(successMessage || res.data.msg)

    else if (errorCode === res.data.code)
      this.error(errorMessage || res.data.msg)

    return res
  }
  catch (error) {
    if (errorMessage)
      this.error(errorMessage)
  }
}

export type MessageFn = (message: string) => void

function useRequest(message: { error: MessageFn; success: MessageFn; info: MessageFn }) {
  return {
    useLoadingRequest: useLoadingRequest.bind(message),
    useIsNullRequest: useIsNullRequest.bind(message),
    useLoadingRequestOrIsNull: useLoadingRequestOrIsNull.bind(message),
    usePaginationRequest: usePaginationRequest.bind(message),
    useAddPagination: useAddPagination.bind(message),
    useMessageRequest: useMessageRequest.bind(message),
    useWebSocket: useWebSocket.bind(message),
  }
}

export default useRequest
