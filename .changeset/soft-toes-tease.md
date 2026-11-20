---
'@dune2/tools': patch
---

修复 `RequestParts.query` 类型为 `object`，允许 `interface` 类型的 `Req` 直接在 `toRequest: (query) => ({ query })` 中返回。
