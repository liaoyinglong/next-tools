---
---

给 `@dune2/test-utils` 补上缺失的 `@types/node` devDependency：该包的 tsconfig 声明了 `types: ["node"]`，缺依赖时 TS 7 报 TS2688，并连带 `fs`/`fs/promises`/`path` 报 TS2591、`readdir` 结果退化成 `any`。只影响类型检查，无发布内容。
