import type { RequestBuilderOptions } from './options';
import { RequestBuilder } from './RequestBuilder';

interface Options<Req, Res> extends Omit<
  Partial<RequestBuilderOptions<Req, Res>>,
  'requestFn'
> {
  /**
   * 相当于 url
   */
  queryKey: string;
  requestFn: (params: Req) => Promise<Res>;
}

/**
 * 快速创建一个 api 配置，底层还是使用 RequestBuilder
 *
 * 使用场景是：
 *  - 享用 rq 管理异步状态，同时想享受 RequestBuilder 所带来的封装以及 requestFn 并不通用
 *
 * 案例：
 *  - 对于 ethers.js 调用的封装
 *  - 访问合约方法等
 *
 * 主要是为了
 *  - 简化实例化 RequestBuilder 的流程
 *  - 为了自定义的 requestFn
 *
 */
export function createApi<Req, Res>(opts: Options<Req, Res>) {
  const { requestFn, ...rest } = opts;
  const api = new RequestBuilder<Req, Res>({
    url: opts.queryKey,
    // 给定 GET 则 在 requestFn 中可以通过 params 获取到参数，否则是 data 字段
    method: 'GET',
    requestFn: (config) => {
      return requestFn(config.params) as never;
    },
    ...rest,
  });

  return api;
}
