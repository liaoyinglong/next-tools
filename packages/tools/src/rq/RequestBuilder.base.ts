import type { QueryClient } from '@tanstack/react-query';
import type { Basic, RequestBuilderOptions, RequestConfig } from './options';

/**
 * RequestBuilder 中与 React / react-query 运行时无关的部分。
 *
 * 正常入口（RequestBuilder.ts）和 react-server 入口
 * （RequestBuilder.react-server.ts）都继承它，请求构造、url 参数替换、
 * queryKey 生成等逻辑因此只有一份实现，避免两个入口逐行重复后悄悄漂移。
 *
 * 这里不能引入 react 或 @tanstack/react-query 的运行时代码，
 * 否则 react-server 入口会被拖进客户端依赖。
 */
export class RequestBuilderBase<Req = any, Res = any> {
  constructor(public options: RequestBuilderOptions<Req, Res>) {
    this.request = this.request.bind(this);
    this.requestWithConfig = this.requestWithConfig.bind(this);
    this.options.method ??= 'get';
  }

  //#region default requestFn
  static requestFn: Basic['requestFn'] | null = null;
  static setRequestFn(requestFn: Basic['requestFn'] | null) {
    this.requestFn = requestFn;
  }
  //#endregion

  /**
   * 默认没有 queryClient 工厂，正常入口会覆盖为包内共享的单例
   */
  static queryClientFactory: (() => QueryClient) | null = null;
  static setQueryClientFactory(factory: (() => QueryClient) | null) {
    this.queryClientFactory = factory;
  }

  /**
   * 实际生效的子类，静态配置需要从它上面读
   * （静态属性写在各子类自己的构造函数上，不能直接引用基类）
   */
  private get Class() {
    return this.constructor as typeof RequestBuilderBase;
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
      this.Class.queryClientFactory?.();
    if (!queryClient) {
      throw new Error('queryClient is not defined');
    }
    return queryClient;
  }

  /**
   * 针对 meta 做一些处理 返回值可以直接传给 rq 的 meta
   */
  protected normalizeMeta(option?: Basic) {
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
      config.requestFn ?? this.options.requestFn ?? this.Class.requestFn;
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
}
