import type { QueryClient } from '@tanstack/react-query';
import type {
  Basic,
  RequestBuilderOptions,
  RequestConfig,
  RequestParts,
} from './options';

const QUERY_DEFAULT_METHODS = new Set(['get', 'head', 'options']);
const NO_BODY_METHODS = new Set(['get', 'head']);
const URL_PATH_PARAM_RE = /\{([^}]+)\}/g;

function extractUrlPathParams(url: string): Set<string> {
  return new Set(Array.from(url.matchAll(URL_PATH_PARAM_RE), (m) => m[1]));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * 未配置 toRequest 时的默认参数分发规则：
 * 所有非 path 参数都归入 method 对应的单一默认位置（GET/HEAD/OPTIONS -> query，其余 -> body）。
 * 需要混合 query + body、非 GET 仅传 query、或 path 与非对象 body 共存等场景，
 * 由调用方或 @dune2/cli 生成的 toRequest 显式映射，不会走到这里。
 */
function defaultParts(
  input: unknown,
  method: string,
  url: string,
  pathParams: Set<string>,
): RequestParts {
  const location = QUERY_DEFAULT_METHODS.has(method.toLowerCase())
    ? 'query'
    : 'body';

  // url 模板没有 {x} 时无需拆分字段，直接把输入原样放到默认位置（保留数组、原始值、FormData 等）
  if (pathParams.size === 0) {
    return input === undefined ? {} : { [location]: input };
  }
  // 缺参时返回空对象，交由下游 resolveUrlPath 统一抛出 "Missing path parameter ..." 错误
  if (input === undefined || input === null) {
    return {};
  }
  if (!isPlainObject(input)) {
    throw new Error(
      `Expected plain object input for ${method.toUpperCase()} ${url}`,
    );
  }

  const path: Record<string, string | number> = {};
  const rest: Record<string, unknown> = {};
  let hasRest = false;

  for (const [key, value] of Object.entries(input)) {
    if (pathParams.has(key)) {
      path[key] = value as string | number;
    } else {
      rest[key] = value;
      hasRest = true;
    }
  }

  // 剔除 path 后若没有剩余字段，不设置空 query / body
  return hasRest ? { path, [location]: rest } : { path };
}

function resolveUrlPath(
  url: string,
  method: string,
  pathParams: Set<string>,
  path?: Record<string, string | number>,
): string {
  const label = `${method.toUpperCase()} ${url}`;
  // 先校验多余字段（即使模板不含 {x} 也校验），避免 toRequest / config.path 拼写错误被静默忽略
  for (const key of Object.keys(path ?? {})) {
    if (!pathParams.has(key)) {
      throw new Error(`Unexpected path parameter "${key}" for ${label}`);
    }
  }
  if (pathParams.size === 0) {
    return url;
  }
  for (const name of pathParams) {
    const value = path?.[name];
    if (value === undefined || value === null) {
      throw new Error(`Missing path parameter "${name}" for ${label}`);
    }
  }
  return url.replace(URL_PATH_PARAM_RE, (_, name: string) =>
    encodeURIComponent(String(path![name])),
  );
}

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
  private readonly pathParams: Set<string>;

  constructor(public options: RequestBuilderOptions<Req, Res>) {
    this.request = this.request.bind(this);
    this.requestWithConfig = this.requestWithConfig.bind(this);
    this.options.method ??= 'get';
    this.pathParams = extractUrlPathParams(this.options.url);
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
   * @param params 请求参数，未配置 toRequest 时按默认规则分发到 path / query / body
   * @param config 请求的配置，一般不需要传，内部用
   */
  request<P extends Req, T = Res>(params?: P, config?: RequestConfig) {
    const method = this.options.method!;
    const parts = this.options.toRequest
      ? this.options.toRequest(params as Req)
      : defaultParts(params, method, this.options.url, this.pathParams);

    return this.requestWithConfig<T>({
      meta: this.options.meta,
      path: parts.path,
      params: parts.query,
      data: parts.body,
      ...config,
    });
  }

  /**
   * 底层请求逃生口：不经过 toRequest，直接透传 config，
   * 但仍会对 url 模板中的 {x} 做 path 替换（从 config.path 读取）。
   */
  requestWithConfig<T = Res>(config: RequestConfig) {
    const method = this.options.method!;
    const { url } = this.options;
    // 优先使用传入的 requestFn
    // 其次使用实例化时候的 requestFn
    const requestFn =
      config.requestFn ?? this.options.requestFn ?? this.Class.requestFn;
    if (!requestFn) {
      throw new Error('request function is not defined');
    }
    if (
      NO_BODY_METHODS.has(method.toLowerCase()) &&
      config.data !== undefined
    ) {
      throw new Error(
        `Request body is not allowed for ${method.toUpperCase()} ${url}`,
      );
    }
    const { path, ...restConfig } = config;
    const resolvedUrl = resolveUrlPath(url, method, this.pathParams, path);
    return requestFn<T>({
      url: resolvedUrl,
      method,
      ...restConfig,
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
