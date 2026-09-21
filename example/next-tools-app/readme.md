# next-tools-app

一个可以真正跑起来的 Next.js 示例，演示 `@dune2/tools` 的三个模块：

- `@dune2/tools/store` — valtio store（页面里的计数器）
- `@dune2/tools/storage` — localStorage 持久化（计数写回 `localStorage`）
- `@dune2/tools/rq` — `RequestBuilder` 的 `useQuery` / `useMutation`（请求打到本示例自己的 `/api/ping`，无需外部服务）

## 运行

```bash
pnpm install                # 在仓库根目录
pnpm --filter next-tools-app dev
```

打开 http://localhost:3000，点几下 `+1` 再刷新页面，计数会从 localStorage 恢复。

构建校验：

```bash
pnpm --filter next-tools-app build
pnpm --filter next-tools-app typecheck
```

## 集成要点

1. **`transpilePackages`**：`@dune2/tools` 直接发布 TS 源码（`exports` 指向 `.ts`/`.tsx`），所以 `next.config.ts` 里必须写 `transpilePackages: ['@dune2/tools']`，否则 `node_modules` 下的 TS 不会被编译。
2. **注册 requestFn**：`RequestBuilder` 不绑定 http 客户端，需要在客户端初始化时调用一次 `RequestBuilder.setRequestFn(...)`，见 `app/providers.tsx`。
3. **SSR 与 localStorage**：`storage.*.useValue()` 在服务端返回默认值，本地存储的值在 `useEffect` 里回填 store，避免水合结果不一致。
