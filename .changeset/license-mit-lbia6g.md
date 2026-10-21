---
'@dune2/babel': patch
'@dune2/cli': patch
'@dune2/tools': patch
'@dune2/vite': patch
---

补充根目录 MIT LICENSE 文件，并把各包 `package.json` 的 `license` 字段统一为 `MIT`（`@dune2/tools` 此前为 ISC，其余包缺失该字段）。同时补充 `@dune2/babel` 的 readme，此前该包在 npm 上没有说明文档。仅元数据变更，不影响运行时行为。
