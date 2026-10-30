# @dune2/vite

## 0.3.1

### Patch Changes

- 8426a31: 补充根目录 MIT LICENSE 文件，并把各包 `package.json` 的 `license` 字段统一为 `MIT`（`@dune2/tools` 此前为 ISC，其余包缺失该字段）。同时补充 `@dune2/babel` 的 readme，此前该包在 npm 上没有说明文档。仅元数据变更，不影响运行时行为。
- f5770cb: 仓库工程化整理：包级 `lint` 脚本改名为 `typecheck`（原本就是 `tsc` 类型检查），并新增根目录 `typecheck` 汇总命令；`@dune2/tools` 的类型级测试脚本单独命名为 `test:types`。仅脚本命名变更，不影响发布产物。

## 0.3.0

### Minor Changes

- acbe3cc: - transform 现在返回 sourcemap（通过 MagicString 重放 ast-grep edits 生成，带自校验，失败时回退为 null）
  - 改用 `parseAsync` 在线程池解析，避免大文件阻塞事件循环
  - 修正 `.` 导出的 types 条件：CJS 消费者现在解析到 `dist/index.d.cts`

### Patch Changes

- acbe3cc: 升级构建与运行时依赖：changesets 3、oxfmt 0.67、vitest 5、tsdown 0.23（`inlineOnly` 迁移为 `deps.onlyBundle`）、swagger-parser 13、@ast-grep/napi 0.45、magic-string 1、publint 0.3.24、@types/js-cookie 3.0.6。@dune2/cli 同时从 Babel 系类型生成器切换到 @fumari/json-schema-ts 的输出（数组 Items 描述会出现在文档注释中）。

## 0.2.0

### Minor Changes

- 21b9593: Add server-only and client-only function transforms for Vite builds, including consumer-aware isomorphic transform handling.

  Refactor transform rule execution into a unified engine to simplify plugin behavior and improve maintainability.

  Migrate plugin tests to fixture-based coverage and add focused scenarios for server/client/isomorphic resolution paths.

## 0.1.1

### Patch Changes

- b7e37cc: use Vite hook filter for transform to reduce unnecessary hook invocations
