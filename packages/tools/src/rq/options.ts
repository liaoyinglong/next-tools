import type {
  QueryClient,
  FetchQueryOptions as RQFetchQueryOptions,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";

import type { AxiosRequestConfig, Method } from "axios";
// 外部可以重写这个类型
export interface RequestBuilderMeta {}

export interface Basic {
  /**
   * 请求方法
   * 1. 实例化的时候会接收一个`requestFn`
   * 2. 如果在调用`request/useQuery`之类的不想用实例化是传入的`requestFn`，可以在`request/useQuery`的第二个参数传入`requestFn`
   * 一般场景是有些情况需要全局`toast`，有些场景不需要，所以在不同的场景下传入不同实现的`requestFn`
   */
  requestFn?: <T = unknown>(config: AxiosRequestConfig) => Promise<T>;

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
  method?: Lowercase<Method>;
  // 请求路径
  url: string;
  // url path 上的参数 , /prefunding-order/{id} 中的 id
  urlPathParams?: string[];

  // 透传给 useQuery 的 options
  useQueryOptions?: Partial<RawUseQueryOptions<Res>>;

  // 透传给 useMutation 的 options
  useMutationOptions?: UseMutationOptions<Res, unknown, Req>;
}

export type RequestConfig = Basic & AxiosRequestConfig;

export type PageData<T = any> = {
  total?: number;
  result: T[];
  extra?: any;
};
