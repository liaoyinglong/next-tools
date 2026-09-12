import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '../../src/rq/defaultQueryClient';
import { RequestBuilder } from '../../src/rq/RequestBuilder';
import { RequestBuilder as RequestBuilderRSC } from '../../src/rq/RequestBuilder.react-server';

const defaultQueryClientFactory = RequestBuilder.queryClientFactory;

afterEach(() => {
  RequestBuilder.setRequestFn(null);
  RequestBuilder.setQueryClientFactory(defaultQueryClientFactory);
});

describe('RequestBuilder 请求构造', () => {
  it('非 GET 方法把参数放进 data，GET 方法放进 params', async () => {
    const requestFn = vi.fn().mockResolvedValue({});
    const post = new RequestBuilder({
      url: '/users',
      method: 'post',
      requestFn,
    });
    const get = new RequestBuilder({ url: '/users', method: 'get', requestFn });

    await post.request({ name: 'a' });
    await get.request({ name: 'a' });

    expect(requestFn).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        url: '/users',
        method: 'post',
        data: { name: 'a' },
        params: undefined,
      }),
    );
    expect(requestFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        url: '/users',
        method: 'get',
        data: undefined,
        params: { name: 'a' },
      }),
    );
  });

  it('urlPathParams 从参数里取值填进 url，且不改动调用方对象', async () => {
    const requestFn = vi.fn().mockResolvedValue({});
    const api = new RequestBuilder({
      url: '/users/{id}/pets/{petId}',
      method: 'get',
      urlPathParams: ['id', 'petId'],
      requestFn,
    });

    const params = { id: '1', petId: '2', q: 'x' };
    await api.request(params);

    expect(requestFn).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/users/1/pets/2',
        params: { q: 'x' },
      }),
    );
    // 参数对象在 queryHash 之后会保持同一引用，这里必须浅拷贝而不是就地删除
    expect(params).toEqual({ id: '1', petId: '2', q: 'x' });
  });

  it('实例上的 requestFn 优先于静态注册的 requestFn', async () => {
    const staticFn = vi.fn().mockResolvedValue({ source: 'static' });
    const instanceFn = vi.fn().mockResolvedValue({ source: 'instance' });
    RequestBuilder.setRequestFn(staticFn);

    const fromStatic = new RequestBuilder({ url: '/a', method: 'get' });
    const fromInstance = new RequestBuilder({
      url: '/b',
      method: 'get',
      requestFn: instanceFn,
    });

    await expect(fromStatic.request()).resolves.toEqual({ source: 'static' });
    await expect(fromInstance.request()).resolves.toEqual({
      source: 'instance',
    });
    expect(instanceFn).toHaveBeenCalledTimes(1);
  });

  it('没有可用的 requestFn 时抛错', () => {
    const api = new RequestBuilder({ url: '/a', method: 'get' });
    expect(() => api.request()).toThrow('request function is not defined');
  });

  it('ensureQueryClient 默认回退到包内共享实例，可被工厂覆盖', () => {
    const api = new RequestBuilder({ url: '/a', method: 'get' });

    expect(api.ensureQueryClient()).toBe(queryClient);

    const custom = new QueryClient();
    RequestBuilder.setQueryClientFactory(() => custom);
    expect(api.ensureQueryClient()).toBe(custom);
    expect(api.ensureQueryClient({ queryClient: queryClient })).toBe(
      queryClient,
    );
  });
});

describe('RequestBuilder react-server 入口', () => {
  it('仍可构造请求与 queryKey', async () => {
    const requestFn = vi.fn().mockResolvedValue({});
    const api = new RequestBuilderRSC({
      url: '/orders/{id}',
      method: 'post',
      urlPathParams: ['id'],
      requestFn,
    });

    expect(api.getQueryKey({ page: 1 })).toEqual([
      '/orders/{id}',
      'post',
      { page: 1 },
    ]);
    await api.request({ id: '9', body: true });
    expect(requestFn).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/orders/9', data: { body: true } }),
    );
  });

  it('依赖 React / react-query 运行时的入口全部抛错', () => {
    const api = new RequestBuilderRSC({ url: '/a', method: 'get' });

    for (const method of [
      api.useQuery,
      api.useSuspenseQuery,
      api.useMutation,
      api.prefetchQuery,
      api.fetchQuery,
      api.invalidateQuery,
      api.refetchQueries,
      api.getQueryData,
      api.setQueryData,
      api.ensureQueryData,
      api.useInfiniteQuery,
      api.defaultQueryFn,
    ]) {
      expect(method).toThrow('This method is not supported in RSC');
    }
  });

  it('没有注入 queryClient 时抛错，注入后可用', () => {
    const api = new RequestBuilderRSC({ url: '/a', method: 'get' });
    expect(() => api.ensureQueryClient()).toThrow('queryClient is not defined');

    const client = new QueryClient();
    expect(api.ensureQueryClient({ queryClient: client })).toBe(client);

    // 正常入口的静态配置不会串到 react-server 入口
    RequestBuilder.setQueryClientFactory(() => queryClient);
    expect(() => api.ensureQueryClient()).toThrow('queryClient is not defined');
  });
});
