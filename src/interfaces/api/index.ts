export interface ResponseData<T> {
  code: string
  msg: string
  data: T
  total?: number
}

export interface PageOptions {
  pageNum?: number
  pageSize?: number
}
