import type { QueryClient } from '@tanstack/react-query';
import type { Basic, RequestBuilderOptions, RequestConfig } from './options';

export class RequestBuilder<Req = any, Res = any> {
  constructor(public options: RequestBuilderOptions<Req, Res>) {
    this.defaultQueryFn = this.defaultQueryFn.bind(this);
    this.request = this.request.bind(this);
    this.requestWithConfig = this.requestWithConfig.bind(this);
    this.options.method ??= 'get';
  }

  //#region default requestFn
  static requestFn: Basic['requestFn'] | null = null;
  static setRequestFn(requestFn: Basic['requestFn'] | null) {
    RequestBuilder.requestFn = requestFn;
  }
  //#endregion

  static queryClientFactory: (() => QueryClient) | null = null;
  static setQueryClientFactory(factory: (() => QueryClient) | null) {
    RequestBuilder.queryClientFactory = factory;
  }

  /**
   * 确保 queryClient 的存在
   * 会依次从以下地方获取
   * - options
   * - 当前实例 options
   * - RequestBuilder.queryClientFactory()
   */
  ensureQueryClient(options?: { queryClient?: QueryClient }) {
    const queryClient =
      options?.queryClient ??
      this.options.queryClient ??
      RequestBuilder.queryClientFactory?.();
    if (!queryClient) {
      throw new Error('queryClient is not defined');
    }
    return queryClient;
  }

  /**
   * 包装好的请求函数
   * useQuery、useMutation 内部会调用这个
   * 另外也可以直接调用这个函数来发送请求
   * @param params 请求参数 默认会根据请求方法来放到 url 上或者 body 里
   * @param config 请求的配置，一般不需要传，内部用
   */
  request<P extends Req, T = Res>(params?: P, config?: RequestConfig) {
    const method = this.options.method!;
    let data;
    // 根据请求方法来放到 url 上或者 body 里
    if (!['get', 'head', 'options'].includes(method)) {
      data = params;
      params = undefined;
    }
    return this.requestWithConfig<T>({
      meta: this.options.meta,
      ...config,
      data,
      params,
    });
  }

  /**
   * 常规情况下使用 request 方法就可以了
   * 特殊情况，如：url 上有 query 参数，又需要传 body 参数
   */
  requestWithConfig<T = Res>(config: RequestConfig) {
    const method = this.options.method!;
    let { url } = this.options;
    // 优先使用传入的 requestFn
    // 其次使用实例化时候的 requestFn
    let requestFn =
      config.requestFn ?? this.options.requestFn ?? RequestBuilder.requestFn;
    if (!requestFn) {
      throw new Error('request function is not defined');
    }
    this.options.urlPathParams?.forEach((param) => {
      let t = '';
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
   * 通常配置 react-query 的 queryKey
   */
  getQueryKey(params?: Req) {
    if (typeof params === 'undefined') {
      return [this.options.url, this.options.method];
    }
    return [this.options.url, this.options.method!, params] as const;
  }
  defaultQueryFn = throwErrorInRSC;

  /**
   * 对 useQuery 的封装
   * 获取数据的时候可以直接调用这个
   * @see https://tanstack.com/query/v4/docs/guides/queries
   */
  useQuery = throwErrorInRSC;

  /**
   * 对 useSuspenseQuery 的封装
   * 获取数据的时候可以直接调用这个
   * @see https://tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQuery
   */
  useSuspenseQuery = throwErrorInRSC;

  /**
   * 用来预请求接口
   * @see https://tanstack.com/query/v4/docs/guides/prefetching
   */
  prefetchQuery = throwErrorInRSC;

  /**
   * 用来请求接口
   * @see https://tanstack.com/query/v4/docs/react/reference/QueryClient#queryclientfetchquery
   */
  fetchQuery = throwErrorInRSC;
  invalidateQuery = throwErrorInRSC;
  refetchQueries = throwErrorInRSC;

  /**
   * https://tanstack.com/query/v5/docs/react/reference/QueryClient#queryclientgetquerydata
   */
  getQueryData = throwErrorInRSC;

  /**
   * https://tanstack.com/query/v5/docs/react/reference/QueryClient#queryclientsetquerydata
   */
  setQueryData = throwErrorInRSC;
  ensureQueryData = throwErrorInRSC;
  useInfiniteQuery = throwErrorInRSC;

  getMutationFn = throwErrorInRSC;
  useMutation = throwErrorInRSC;
}

const throwErrorInRSC = () => {
  throw new Error('This method is not supported in RSC');
};
