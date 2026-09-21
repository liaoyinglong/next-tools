import type { RequestBuilderOptions } from './options';
import { RequestBuilderBase } from './RequestBuilder.base';

/**
 * react-server 入口：可以构造请求、拼 url、生成 queryKey，
 * 但所有依赖 React / react-query 运行时的方法都会直接抛错。
 *
 * 与正常入口共用 RequestBuilderBase，保证请求构造逻辑只有一份实现。
 */
export class RequestBuilder<Req = any, Res = any> extends RequestBuilderBase<
  Req,
  Res
> {
  constructor(options: RequestBuilderOptions<Req, Res>) {
    super(options);
    this.defaultQueryFn = this.defaultQueryFn.bind(this);
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
