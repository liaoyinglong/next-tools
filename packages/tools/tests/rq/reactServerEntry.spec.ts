import { describe, expect, it, vi } from 'vitest';

// react-server 入口不能把客户端运行时拖进 RSC bundle：
// 这两个模块在 RSC 入口的依赖图里只允许以 `import type` 形式出现。
vi.mock('react', () => {
  throw new Error('react 运行时不应被 react-server 入口加载');
});
vi.mock('@tanstack/react-query', () => {
  throw new Error('@tanstack/react-query 运行时不应被 react-server 入口加载');
});

import { RequestBuilder } from '../../src/rq/RequestBuilder.react-server';

describe('react-server 入口依赖', () => {
  it('在没有 react / react-query 运行时的环境下可构造请求', async () => {
    const requestFn = vi.fn().mockResolvedValue({ ok: true });
    const api = new RequestBuilder({ url: '/a', method: 'post', requestFn });

    expect(api.getQueryKey()).toEqual(['/a', 'post']);
    await expect(api.request({ v: 1 })).resolves.toEqual({ ok: true });
    expect(requestFn).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/a', data: { v: 1 } }),
    );
  });
});
