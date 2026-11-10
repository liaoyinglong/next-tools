---
'@dune2/tools': minor
---

RequestBuilder 的 `fetchQuery` / `prefetchQuery` / `ensureQueryData` 改为基于 `queryClient.query()` 实现，消除 react-query 5.102 起的 deprecated 提示；对外方法名、参数和行为保持不变。

**升级要求**：`@tanstack/react-query` peer 依赖提升到 `^5.102.0`（`queryClient.query()` 从该版本开始提供）。
