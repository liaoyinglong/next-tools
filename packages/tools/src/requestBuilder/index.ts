import {
  FetchQueryOptions,
  QueryClient,
  QueryFunctionContext,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import { AxiosRequestConfig, Method } from "axios";
import { useMemo } from "react";

type Basic = {
  /**
   * 请求方法
   * 1. 实例化的时候会接收一个`requestFn`
   * 2. 如果在调用`request/useQuery`之类的不想用实例化是传入的`requestFn`，可以在`request/useQuery`的第二个参数传入`requestFn`
   * 一般场景是有些情况需要全局`toast`，有些场景不需要，所以在不同的场景下传入不同实现的`requestFn`
   */
  requestFn?: <T = unknown>(config: AxiosRequestConfig) => Promise<T>;
};

export interface RequestBuilderOptions<Req, Res> extends Basic {
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

  queryClient?: QueryClient;
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
  /**
   * 包装好的请求函数
   * useQuery、useMutation 内部会调用这个
   * 另外也可以直接调用这个函数来发送请求
   * @param params 请求参数 默认会根据请求方法来放到url上或者body里
   * @param config axios的配置，一般不需要传，内部用
   */
  request<P = Req, T = Res>(params?: P, config?: RequestConfig) {
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
    let requestFn = config.requestFn ?? this.options.requestFn;
    if (!requestFn) {
      throw new Error("request function is not defined");
    }
    this.options.urlPathParams?.forEach((param) => {
      let t = "";
      //region config.params || config.data 在 queryHash 之后不变的话，会保持同一个引用，这里需要做个浅拷贝，将引用打破
      if (config.params?.[param]) {
        config.params = { ...config.params };
        t = config.params[param];
        delete config.params[param];
      } else if (config.data?.[param]) {
        config.data = { ...config.data };
        t = config.data[param];
        delete config.data[param];
      }
      //endregion
      url = url.replace(`{${param}}`, t);
    });
    return requestFn<T>({
      url,
      method,
      ...config,
    });
  }

  //region query
  /**
   * 获取 queryKey
   * 通常配置react-query的queryKey
   */
  getQueryKey(params?: Req) {
    return [this.options.url, this.options.method!, params] as const;
  }
  private async defaultQueryFn(
    ctx: QueryFunctionContext<[string, string, Req]>
  ): Promise<Res> {
    return this.request(ctx.queryKey[2], {
      signal: ctx.signal,
      requestFn: ctx.meta?.requestFn as never,
    });
  }

  /**
   * 对 useQuery 的封装
   * 获取数据的时候可以直接调用这个
   * @see https://tanstack.com/query/v4/docs/guides/queries
   */
  useQuery(params?: Req, options?: UseQueryOptions<Res> & Basic) {
    const { useQueryOptions } = this.options;
    const res = useQuery({
      queryFn: this.defaultQueryFn,
      queryKey: this.getQueryKey(params),
      ...useQueryOptions,
      ...options,
      // @ts-expect-error 后续处理类型问题
      meta: {
        ...options?.meta,
        requestFn: options?.requestFn ?? this.options.requestFn,
      },
    });
    return res as UseQueryResult<Res>;
  }

  /**
   * 用来预请求接口
   * @see https://tanstack.com/query/v4/docs/guides/prefetching
   */
  prefetchQuery(params?: Req, options?: FetchQueryOptions<Res> & Basic) {
    const queryClient = this.options.queryClient;
    if (!queryClient) {
      throw new Error("没有传入 queryClient，无法预请求，可以在构造函数中传入");
    }
    // @ts-expect-error 后续处理类型问题
    return queryClient.prefetchQuery({
      queryKey: this.getQueryKey(params),
      queryFn: this.defaultQueryFn,
      ...options,
      meta: {
        ...options?.meta,
        requestFn: options?.requestFn,
      },
    });
  }
  //endregion
  //#region useInfiniteQuery
  useInfiniteQuery(
    params?: Omit<Req, "pageNum" | "pageSize" | "count"> & {
      pageSize?: number;
      count?: boolean;
    },
    options?: UseInfiniteQueryOptions<Res> & Basic
  ) {
    const pageSize = params?.pageSize ?? 10;
    const res = useInfiniteQuery({
      queryFn: (ctx) => {
        return this.request(
          {
            pageNum: ctx.pageParam ?? 1,
            // @ts-expect-error 后续处理类型问题
            ...ctx.queryKey[2],
          },
          {
            signal: ctx.signal,
            requestFn: ctx.meta?.requestFn as never,
          }
        );
      },
      // @ts-expect-error 后续处理类型问题
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
      meta: {
        ...options?.meta,
        requestFn: options?.requestFn ?? this.options.requestFn,
      },
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
    return { ...res, data: data as Data<Res>, rawData };
  }
  //#endregion

  //#region mutation

  private getMutationFn(config?: Basic) {
    if (config?.requestFn) {
      return (params: Req) => this.request(params, config);
    }
    return this.request;
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
