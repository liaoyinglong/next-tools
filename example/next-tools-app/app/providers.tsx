'use client';

import { RequestBuilder } from '@dune2/tools/rq';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

// RequestBuilder 不绑定任何 http 客户端，全局注册一次具体的请求实现。
// 这里用浏览器 fetch 指向本示例自己的 route handler，示例因此可以离线运行。
RequestBuilder.setRequestFn(async ({ url, method, params, data, signal }) => {
  const query = params
    ? `?${new URLSearchParams(params as Record<string, string>)}`
    : '';
  const init: RequestInit = { method, signal };
  // body 只在真的有请求体时带上，GET/HEAD 带 body 会被运行时拒绝
  if (data !== undefined) {
    init.body = JSON.stringify(data);
    init.headers = { 'content-type': 'application/json' };
  }
  const res = await fetch(`${url}${query}`, init);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
});

export function Providers({ children }: { children: ReactNode }) {
  // 每个浏览器会话一个 QueryClient，避免请求之间串数据
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
