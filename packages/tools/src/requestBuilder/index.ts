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

export interface RequestBuilderOptions<Req, Res> {
  /**
   * 请求方法
   * @default "get"
   */
  method?: Lowercase<Method>;
  // 请求路径
  url: string;
  // url path 上的参数 , /prefunding-order/{id} 中的 id
  urlPathParams?: string[];

  requestFn?: <T = unknown>(config: AxiosRequestConfig) => Promise<T>;

  // 透传给 useQuery 的 options
  useQueryOptions?: Omit<UseQueryOptions, "queryKey">;

  // 透传给 useMutation 的 options
  useMutationOptions?: UseMutationOptions<Res, unknown, Req>;

  queryClient?: QueryClient;
}

export class RequestBuilder<Req = any, Res = any> {
  constructor(public options: RequestBuilderOptions<Req, Res>) {
    this.queryFn = this.queryFn.bind(this);
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
  request<P = Req, T = Res>(params?: P, config?: AxiosRequestConfig) {
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
  requestWithConfig<T>(config: AxiosRequestConfig) {
    let { requestFn, url } = this.options;
    const method = this.options.method!;
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

  /**
   * 获取 queryKey
   * 通常配置react-query的queryKey
   */
  getQueryKey(params?: Req) {
    return [this.options.url, this.options.method!, params];
  }
  private async queryFn(
    ctx: QueryFunctionContext<[string, string, Req]>
  ): Promise<Res> {
    return this.request(ctx.queryKey[2], { signal: ctx.signal });
  }
  /**
   * 对 useQuery 的封装
   * 获取数据的时候可以直接调用这个
   * @see https://tanstack.com/query/v4/docs/guides/queries
   */
  useQuery(params?: Req, options?: UseQueryOptions<Res>) {
    const { useQueryOptions } = this.options;
    // @ts-expect-error 后续处理类型问题
    return useQuery({
      queryFn: this.queryFn,
      queryKey: this.getQueryKey(params),
      ...useQueryOptions,
      ...options,
    });
  }

  /**
   * 对 useMutation 的封装
   * 提交数据的时候可以直接调用这个
   * @see https://tanstack.com/query/v4/docs/guides/mutations
   */
  useMutation(options?: UseMutationOptions<Res, unknown, Req>) {
    return useMutation({
      mutationFn: this.request,
      ...this.options.useMutationOptions,
      ...options,
    });
  }

  /**
   * 用来预请求接口
   * @see https://tanstack.com/query/v4/docs/guides/prefetching
   */
  prefetchQuery(params?: Req, options?: FetchQueryOptions<Res>) {
    const queryClient = this.options.queryClient;
    if (!queryClient) {
      throw new Error("没有传入 queryClient，无法预请求，可以在构造函数中传入");
    }
    // @ts-expect-error 后续处理类型问题
    return queryClient.prefetchQuery({
      queryKey: this.getQueryKey(params),
      queryFn: this.queryFn,
      ...options,
    });
  }
}
