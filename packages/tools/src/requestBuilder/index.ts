import {
  UseQueryOptions,
  UseMutationOptions,
  useQuery,
  QueryFunctionContext,
  useMutation,
  QueryClient,
  FetchQueryOptions,
} from "@tanstack/react-query";

import { Method, AxiosRequestConfig } from "axios";

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
    if (!["delete", "get", "head", "options"].includes(method)) {
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
      url = url.replace(
        `{${param}}`,
        config.params?.[param] ?? config.data?.[param]
      );
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
    return [this.options.url, this.options.method!, params];
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
    return useQuery({
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
