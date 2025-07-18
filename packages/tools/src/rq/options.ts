import type {
  QueryClient,
  FetchQueryOptions as RQFetchQueryOptions,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";

// 定义 HTTP 方法类型
export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options";
// 外部可以重写这个类型
export interface RequestBuilderMeta {}

// 通用的请求配置接口，不依赖于具体的 HTTP 库
export interface RequestFnParams {
  /** 请求URL */
  url?: string;
  /** HTTP 请求方法 */
  method?: string;
  /** URL 查询参数 */
  params?: any;
  /** 请求体数据 */
  data?: any;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求取消 */
  signal?: AbortSignal;
}

export interface Basic {
  /**
   * 请求方法
   * 1. 实例化的时候会接收一个`requestFn`
   * 2. 如果在调用`request/useQuery`之类的不想用实例化是传入的`requestFn`，可以在`request/useQuery`的第二个参数传入`requestFn`
   * 一般场景是有些情况需要全局`toast`，有些场景不需要，所以在不同的场景下传入不同实现的`requestFn`
   */
  requestFn?: <T = unknown>(params: RequestFnParams) => Promise<T>;

  meta?: RequestBuilderMeta;
}
export interface QueryClientBasic {
  queryClient?: QueryClient;
}

type OmitMetaAndPartial<T> = Partial<Omit<T, "meta">>;

type RawUseQueryOptions<T> = Parameters<typeof useQuery<T>>[0];
// 透传给 useQuery
export interface UseQueryOptions<T>
  extends OmitMetaAndPartial<RawUseQueryOptions<T>>,
    Basic {}

// 透传给 ensureQueryData / fetchQuery / prefetchQuery 等
export interface FetchQueryOptions<T>
  extends OmitMetaAndPartial<RQFetchQueryOptions<T>>,
    Basic,
    QueryClientBasic {}

export interface RequestBuilderOptions<Req, Res>
  extends Basic,
    QueryClientBasic {
  /**
   * 请求方法
   * @default "get"
   */
  method?: HttpMethod;
  // 请求路径
  url: string;
  // url path 上的参数 , /prefunding-order/{id} 中的 id
  urlPathParams?: string[];

  // 透传给 useQuery 的 options
  useQueryOptions?: Partial<RawUseQueryOptions<Res>>;

  // 透传给 useMutation 的 options
  useMutationOptions?: UseMutationOptions<Res, unknown, Req>;
}

export type RequestConfig = Basic & RequestFnParams;

export type PageData<T = any> = {
  total?: number;
  result: T[];
  extra?: any;
};
