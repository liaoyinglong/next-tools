import { describe, expect, it, vi } from 'vitest';
import { RequestBuilder } from '../../src/rq/RequestBuilder';

describe('RequestBuilder toRequest 与默认参数映射', () => {
  describe('默认规则（省略 toRequest）', () => {
    it('无 path 参数时：GET / HEAD / OPTIONS 放 query，其他 method 放 body', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const getApi = new RequestBuilder({
        url: '/items',
        method: 'get',
        requestFn,
      });
      const headApi = new RequestBuilder({
        url: '/items',
        method: 'head',
        requestFn,
      });
      const optionsApi = new RequestBuilder({
        url: '/items',
        method: 'options',
        requestFn,
      });
      const postApi = new RequestBuilder({
        url: '/items',
        method: 'post',
        requestFn,
      });

      await getApi.request({ page: 1 });
      await headApi.request({ page: 1 });
      await optionsApi.request({ page: 1 });
      await postApi.request({ name: 'a' });

      expect(requestFn).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: '/items',
          method: 'get',
          params: { page: 1 },
          data: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: '/items',
          method: 'head',
          params: { page: 1 },
          data: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          url: '/items',
          method: 'options',
          params: { page: 1 },
          data: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          url: '/items',
          method: 'post',
          params: undefined,
          data: { name: 'a' },
        }),
      );
    });

    it('无 path 参数时原样传递数组、原始值和 undefined', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const batchCreate = new RequestBuilder<Array<{ name: string }>>({
        url: '/items/batch',
        method: 'post',
        requestFn,
      });
      const rawPost = new RequestBuilder<string>({
        url: '/items/raw',
        method: 'post',
        requestFn,
      });
      const emptyGet = new RequestBuilder({
        url: '/items',
        method: 'get',
        requestFn,
      });

      await batchCreate.request([{ name: 'a' }, { name: 'b' }]);
      await rawPost.request('hello');
      await emptyGet.request();

      expect(requestFn).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: '/items/batch',
          data: [{ name: 'a' }, { name: 'b' }],
          params: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: '/items/raw',
          data: 'hello',
          params: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          url: '/items',
          data: undefined,
          params: undefined,
        }),
      );
    });

    it('有 path 参数时取出 path 字段，其余放到默认位置；剩余为空时不设置 query / body', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const getItem = new RequestBuilder<{ id: string; page?: number }>({
        url: '/items/{id}',
        method: 'get',
        requestFn,
      });
      const putItem = new RequestBuilder<{ id: number; name?: string }>({
        url: '/items/{id}',
        method: 'put',
        requestFn,
      });

      await getItem.request({ id: '42', page: 2 });
      await getItem.request({ id: '42' });
      await putItem.request({ id: 0, name: 'zero' });
      await putItem.request({ id: 0 });

      expect(requestFn).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: '/items/42',
          params: { page: 2 },
          data: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: '/items/42',
          params: undefined,
          data: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          url: '/items/0',
          params: undefined,
          data: { name: 'zero' },
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          url: '/items/0',
          params: undefined,
          data: undefined,
        }),
      );
    });

    it('有 path 参数但输入不是 plain object 时抛错', () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const api = new RequestBuilder<any>({
        url: '/items/{id}',
        method: 'post',
        requestFn,
      });

      expect(() => api.request(['a'])).toThrow(
        'Expected plain object input for POST /items/{id}',
      );
      expect(() => api.request('raw')).toThrow(
        'Expected plain object input for POST /items/{id}',
      );
    });
  });

  describe('显式 toRequest', () => {
    it('支持 path + query + body 混合映射', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const createOrder = new RequestBuilder<{
        shopId: string;
        dryRun?: boolean;
        sku: string;
        count: number;
      }>({
        url: '/shops/{shopId}/orders',
        method: 'post',
        requestFn,
        toRequest: ({ shopId, dryRun, ...body }) => ({
          path: { shopId },
          query: { dryRun },
          body,
        }),
      });

      const input = { shopId: 's1', dryRun: true, sku: 'A', count: 2 };
      await createOrder.request(input);

      expect(requestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/shops/s1/orders',
          method: 'post',
          params: { dryRun: true },
          data: { sku: 'A', count: 2 },
        }),
      );
      // queryKey 仍然使用原始输入，不受 toRequest 影响
      expect(createOrder.getQueryKey(input)).toEqual([
        '/shops/{shopId}/orders',
        'post',
        input,
      ]);
    });

    it('支持非 GET 请求只传 query 而不传 body', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const deleteItem = new RequestBuilder<{ id: string; force?: boolean }>({
        url: '/items/{id}',
        method: 'delete',
        requestFn,
        toRequest: ({ id, ...query }) => ({ path: { id }, query }),
      });

      await deleteItem.request({ id: '9', force: true });

      expect(requestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/items/9',
          method: 'delete',
          params: { force: true },
          data: undefined,
        }),
      );
    });

    it('支持 wrapped body（数组 body 与 path 共存）和改名映射', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const setTags = new RequestBuilder<{ id: string; body: string[] }>({
        url: '/items/{id}/tags',
        method: 'put',
        requestFn,
        toRequest: ({ id, body }) => ({ path: { id }, body }),
      });
      const patchUser = new RequestBuilder<{
        pathId: string;
        id: string;
        name?: string;
      }>({
        url: '/users/{id}',
        method: 'patch',
        requestFn,
        toRequest: ({ pathId, ...body }) => ({ path: { id: pathId }, body }),
      });

      await setTags.request({ id: '1', body: ['a', 'b'] });
      await patchUser.request({ pathId: 'p1', id: 'b1', name: 'neo' });

      expect(requestFn).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: '/items/1/tags',
          data: ['a', 'b'],
          params: undefined,
        }),
      );
      expect(requestFn).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: '/users/p1',
          data: { id: 'b1', name: 'neo' },
          params: undefined,
        }),
      );
    });

    it('request 的 config 可覆盖默认生成的 params / data', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const api = new RequestBuilder<{ name: string }>({
        url: '/items',
        method: 'post',
        requestFn,
      });

      await api.request(
        { name: 'a' },
        { params: { dryRun: true }, headers: { 'X-Test': '1' } },
      );

      expect(requestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/items',
          method: 'post',
          params: { dryRun: true },
          data: { name: 'a' },
          headers: { 'X-Test': '1' },
        }),
      );
    });
  });

  describe('path 校验与编码', () => {
    it('缺失 path 参数或值为 null / undefined 时抛错', () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const api = new RequestBuilder<any>({
        url: '/users/{id}/posts/{postId}',
        method: 'get',
        requestFn,
      });

      expect(() => api.request()).toThrow(
        'Missing path parameter "id" for GET /users/{id}/posts/{postId}',
      );
      expect(() => api.request({ id: '1' })).toThrow(
        'Missing path parameter "postId" for GET /users/{id}/posts/{postId}',
      );
      expect(() => api.request({ id: null, postId: '2' })).toThrow(
        'Missing path parameter "id" for GET /users/{id}/posts/{postId}',
      );
      expect(() => api.request({ id: undefined, postId: '2' })).toThrow(
        'Missing path parameter "id" for GET /users/{id}/posts/{postId}',
      );
    });

    it('parts.path 中出现 url 模板之外的多余字段时抛错', () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const api = new RequestBuilder<{ userId: string }>({
        url: '/users/{id}',
        method: 'get',
        requestFn,
        toRequest: ({ userId }) => ({ path: { userId } }),
      });

      expect(() => api.request({ userId: '1' })).toThrow(
        'Unexpected path parameter "userId" for GET /users/{id}',
      );
    });

    it('对 path 参数值统一使用 encodeURIComponent 编码', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const api = new RequestBuilder<{ id: string }>({
        url: '/files/{id}',
        method: 'get',
        requestFn,
      });

      await api.request({ id: 'a/b c?d#e' });

      expect(requestFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/files/a%2Fb%20c%3Fd%23e',
        }),
      );
    });
  });

  describe('GET / HEAD 禁止 body', () => {
    it.each(['get', 'head'] as const)('%s 方法返回 body 时抛错', (method) => {
      const requestFn = vi.fn().mockResolvedValue({});
      const api = new RequestBuilder<{ a: number }>({
        url: '/items',
        method,
        requestFn,
        toRequest: (body) => ({ body }),
      });

      expect(() => api.request({ a: 1 })).toThrow(
        `Request body is not allowed for ${method.toUpperCase()} /items`,
      );
    });
  });

  describe('requestWithConfig', () => {
    it('跳过 toRequest，但仍从 config.path 替换 url 模板，且不把 path 传给 requestFn', async () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const toRequest = vi.fn();
      const api = new RequestBuilder<{ id: string }>({
        url: '/items/{id}',
        method: 'post',
        requestFn,
        toRequest,
      });

      await api.requestWithConfig({
        path: { id: 'a/b' },
        params: { dryRun: true },
        data: { name: 'x' },
      });

      expect(toRequest).not.toHaveBeenCalled();
      expect(requestFn).toHaveBeenCalledWith({
        url: '/items/a%2Fb',
        method: 'post',
        params: { dryRun: true },
        data: { name: 'x' },
      });
    });

    it('requestWithConfig 缺少或传错 config.path 时同样抛错', () => {
      const requestFn = vi.fn().mockResolvedValue({});
      const api = new RequestBuilder({
        url: '/items/{id}',
        method: 'get',
        requestFn,
      });

      expect(() => api.requestWithConfig({})).toThrow(
        'Missing path parameter "id" for GET /items/{id}',
      );
      expect(() =>
        api.requestWithConfig({ path: { id: '1', extra: '2' } }),
      ).toThrow('Unexpected path parameter "extra" for GET /items/{id}');
    });
  });
});
