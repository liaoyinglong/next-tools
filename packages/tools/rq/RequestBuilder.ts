import type {
  DefaultError,
  FetchQueryOptions,
  InfiniteData,
  InvalidateOptions,
  QueryClient,
  QueryFunctionContext,
  RefetchOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import type { AxiosRequestConfig, Method } from "axios";
import { useDebugValue, useMemo } from "react";
import { queryClient } from "./defaultQueryClient";

// 外部可以重写这个类型
export interface RequestBuilderMeta {}

interface Basic {
  /**
   * 请求方法
   * 1. 实例化的时候会接收一个`requestFn`
   * 2. 如果在调用`request/useQuery`之类的不想用实例化是传入的`requestFn`，可以在`request/useQuery`的第二个参数传入`requestFn`
   * 一般场景是有些情况需要全局`toast`，有些场景不需要，所以在不同的场景下传入不同实现的`requestFn`
   */
  requestFn?: <T = unknown>(config: AxiosRequestConfig) => Promise<T>;

  meta?: RequestBuilderMeta;
}
interface QueryClientBasic {
  queryClient?: QueryClient;
}

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
  useQueryOptions?: Omit<UseQueryOptions, "queryKey">;

  // 透传给 useMutation 的 options
  useMutationOptions?: UseMutationOptions<Res, unknown, Req>;
}

type RequestConfig = Basic & AxiosRequestConfig;

type PageData<T = any> = {
  total?: number;
  result: T[];
  extra?: any;
};

export class RequestBuilder<Req = any, Res = any> {
  constructor(public options: RequestBuilderOptions<Req, Res>) {
    this.defaultQueryFn = this.defaultQueryFn.bind(this);
    this.request = this.request.bind(this);
    this.requestWithConfig = this.requestWithConfig.bind(this);
    this.options.method ??= "get";
  }

  //#region default requestFn
  static requestFn: Basic["requestFn"] | null = null;
  static setRequestFn(requestFn: Basic["requestFn"] | null) {
    RequestBuilder.requestFn = requestFn;
  }
  //#endregion

  // 这是默认的 Query Client 实例
  static queryClient: QueryClient | null = queryClient;
  static setQueryClient(queryClient: QueryClient | null) {
    RequestBuilder.queryClient = queryClient;
  }

  /**
   * 确保 queryClient 的存在
   * 会依次从以下地方获取
   * - options
   * - 当前实例 options
   * - RequestBuilder.queryClient
   */
  ensureQueryClient(options?: { queryClient?: QueryClient }) {
    const queryClient =
      options?.queryClient ??
      this.options.queryClient ??
      RequestBuilder.queryClient;
    if (!queryClient) {
      throw new Error("queryClient is not defined");
    }
    return queryClient;
  }

  /**
   * 针对 meta 做一些处理 返回值可以直接传给 rq 的 meta
   */
  private normalizeMeta(option?: Basic) {
    return {
      ...this.options.meta,
      ...option?.meta,
      requestFn: option?.requestFn,
    };
  }

  /**
   * 包装好的请求函数
   * useQuery、useMutation 内部会调用这个
   * 另外也可以直接调用这个函数来发送请求
   * @param params 请求参数 默认会根据请求方法来放到url上或者body里
   * @param config axios的配置，一般不需要传，内部用
   */
  request<P extends Req, T = Res>(params?: P, config?: RequestConfig) {
    const method = this.options.method!;
    let data;
    // 根据请求方法来放到url上或者body里
    if (!["get", "head", "options"].includes(method)) {
      data = params;
      params = undefined;
    }
    return this.requestWithConfig<T>({ ...config, data, params });
  }

  /**
   * 常规情况下使用 request 方法就可以了
   * 特殊情况，如：url上有query参数，又需要传body参数
   */
  requestWithConfig<T = Res>(config: RequestConfig) {
    const method = this.options.method!;
    let { url } = this.options;
    // 优先使用传入的 requestFn
    // 其次使用实例化时候的 requestFn
    let requestFn =
      config.requestFn ?? this.options.requestFn ?? RequestBuilder.requestFn;
    if (!requestFn) {
      throw new Error("request function is not defined");
    }
    this.options.urlPathParams?.forEach((param) => {
      let t = "";
      //#region config.params || config.data 在 queryHash 之后不变的话，会保持同一个引用，这里需要做个浅拷贝，将引用打破
      if (config.params?.[param]) {
        config.params = { ...config.params };
        t = config.params[param];
        delete config.params[param];
      } else if (config.data?.[param]) {
        config.data = { ...config.data };
        t = config.data[param];
        delete config.data[param];
      }
      //#endregion
      url = url.replace(`{${param}}`, t);
    });
    return requestFn<T>({
      url,
      method,
      ...config,
    });
  }

  //#region query

  /**
   * 获取 queryKey
   * 通常配置react-query的queryKey
   */
  getQueryKey(params?: Req) {
    if (typeof params === "undefined") {
      return [this.options.url, this.options.method];
    }
    return [this.options.url, this.options.method!, params] as const;
  }
  async defaultQueryFn<T = Res>(ctx: QueryFunctionContext): Promise<T> {
    const queryKey = ctx.queryKey as [url: string, method: string, Req];

    return this.request(queryKey[2], {
      signal: ctx.signal,
      meta: ctx.meta,
      requestFn: ctx.meta?.requestFn as never,
    });
  }

  /**
   * 对 useQuery 的封装
   * 获取数据的时候可以直接调用这个
   * @see https://tanstack.com/query/v4/docs/guides/queries
   */
  useQuery<T = Res>(params?: Req, options?: UseQueryOptions<T> & Basic) {
    const { useQueryOptions } = this.options;
    const res = useQuery<T>({
      // @ts-expect-error 后续处理类型问题
      queryFn: this.defaultQueryFn,
      queryKey: this.getQueryKey(params),
      ...useQueryOptions,
      ...options,
      meta: this.normalizeMeta(options),
    });
    return res as UseQueryResult<T>;
  }

  /**
   * 用来预请求接口
   * @see https://tanstack.com/query/v4/docs/guides/prefetching
   */
  prefetchQuery(
    params?: Req,
    options?: FetchQueryOptions<Res> & Basic & QueryClientBasic,
  ) {
    const queryClient = this.ensureQueryClient(options);
    return queryClient.prefetchQuery({
      queryKey: this.getQueryKey(params),
      queryFn: this.defaultQueryFn,
      ...options,
      meta: this.normalizeMeta(options),
    });
  }

  /**
   * 用来请求接口
   * @see https://tanstack.com/query/v4/docs/react/reference/QueryClient#queryclientfetchquery
   */
  fetchQuery(
    params?: Req,
    options?: FetchQueryOptions<Res> & Basic & QueryClientBasic,
  ) {
    const queryClient = this.ensureQueryClient(options);
    return queryClient.fetchQuery({
      queryKey: this.getQueryKey(params),
      queryFn: this.defaultQueryFn,
      ...options,
      meta: this.normalizeMeta(options),
    });
  }
  invalidateQuery(
    params?: Req,
    options?: InvalidateOptions & QueryClientBasic,
  ) {
    const queryClient = this.ensureQueryClient(options);
    return queryClient.invalidateQueries({
      queryKey: this.getQueryKey(params),
      ...options,
    });
  }
  refetchQueries(params?: Req, options?: RefetchOptions & QueryClientBasic) {
    const queryClient = this.ensureQueryClient(options);
    return queryClient.refetchQueries({
      queryKey: this.getQueryKey(params),
      ...options,
    });
  }

  /**
   * https://tanstack.com/query/v5/docs/react/reference/QueryClient#queryclientgetquerydata
   */
  getQueryData(params?: Req, option?: QueryClientBasic) {
    const queryClient = this.ensureQueryClient(option);
    return queryClient.getQueryData(this.getQueryKey(params));
  }

  /**
   * https://tanstack.com/query/v5/docs/react/reference/QueryClient#queryclientsetquerydata
   */
  setQueryData(params?: Req, data?: Res, option?: QueryClientBasic) {
    const queryClient = this.ensureQueryClient(option);
    return queryClient.setQueryData(this.getQueryKey(params), data);
  }

  /**
   * https://tanstack.com/query/v5/docs/react/reference/QueryClient#queryclientensurequerydata
   */
  ensureQueryData(params?: Req, option?: Basic & QueryClientBasic) {
    const queryClient = this.ensureQueryClient(option);
    return queryClient.ensureQueryData({
      queryKey: this.getQueryKey(params),
      queryFn: this.defaultQueryFn,
      ...option,
      meta: this.normalizeMeta(option),
    });
  }
  //#endregion
  //#region useInfiniteQuery
  useInfiniteQuery(
    params?: Req,
    options?: UseInfiniteQueryOptions<Res, DefaultError, InfiniteData<Res>> &
      Basic,
  ) {
    // @ts-expect-error 后续处理类型问题
    const pageSize = params?.pageSize ?? 10;
    const res = useInfiniteQuery({
      queryFn: (ctx) => {
        // @ts-expect-error 后续处理类型问题
        const { pageNum, ...rest } = ctx.queryKey[2];
        return this.request(
          {
            ...rest,
            pageNum: ctx.pageParam ?? pageNum ?? 1,
          },
          {
            ...ctx.meta,
            signal: ctx.signal,
            requestFn: options?.requestFn,
          },
        );
      },
      initialPageParam: 1,
      queryKey: this.getQueryKey(params),
      getNextPageParam: (_lastPage, _allPages) => {
        let lastPage = _lastPage as PageData;
        let allPages = _allPages as PageData[];
        // 如果最后一页的数据不满足pageSize，说明没有下一页了
        if (lastPage.result.length < pageSize) {
          return undefined;
        }
        return allPages.length + 1;
      },
      ...options,
      meta: this.normalizeMeta(options),
    });

    const rawData = res.data;

    const data = useMemo(() => {
      return (
        rawData?.pages.flatMap((page) => {
          const pageData = page as PageData;
          return pageData.result;
        }) ?? []
      );
    }, [rawData]);

    type Data<T> = T extends PageData ? T["result"] : T;

    const result = { ...res, data: data as Data<Res>, rawData };
    useDebugValue(result);
    return result;
  }
  //#endregion

  //#region mutation

  private getMutationFn(config?: Basic) {
    return (params: Req) =>
      this.request(params, {
        ...config,
        meta: this.normalizeMeta(config),
      });
  }

  /**
   * 对 useMutation 的封装
   * 提交数据的时候可以直接调用这个
   * @see https://tanstack.com/query/v4/docs/guides/mutations
   */
  useMutation(options?: UseMutationOptions<Res, unknown, Req> & Basic) {
    return useMutation({
      mutationFn: this.getMutationFn(options),
      ...this.options.useMutationOptions,
      ...options,
    });
  }
  //#endregion
}
