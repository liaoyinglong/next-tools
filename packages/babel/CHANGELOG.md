# @dune2/babel

## 2.1.1

### Patch Changes

- 8426a31: 补充根目录 MIT LICENSE 文件，并把各包 `package.json` 的 `license` 字段统一为 `MIT`（`@dune2/tools` 此前为 ISC，其余包缺失该字段）。同时补充 `@dune2/babel` 的 readme，此前该包在 npm 上没有说明文档。仅元数据变更，不影响运行时行为。
- f5770cb: 仓库工程化整理：包级 `lint` 脚本改名为 `typecheck`（原本就是 `tsc` 类型检查），并新增根目录 `typecheck` 汇总命令；`@dune2/tools` 的类型级测试脚本单独命名为 `test:types`。仅脚本命名变更，不影响发布产物。

## 2.1.0

### Minor Changes

- acbe3cc: - 修复 `.` 导出指向不存在的 `dist/index.d.ts` / `dist/index.js`，现在指向真实产物并 re-export `createStorePlugin`
  - 为 CJS 消费者补充 `dist/*.d.cts` 类型条件
  - 抽取两个 snapshot handler 中重复的 selector 提升与改写逻辑到 `shared.ts`，行为不变

### Patch Changes

- acbe3cc: 升级构建与运行时依赖：changesets 3、oxfmt 0.67、vitest 5、tsdown 0.23（`inlineOnly` 迁移为 `deps.onlyBundle`）、swagger-parser 13、@ast-grep/napi 0.45、magic-string 1、publint 0.3.24、@types/js-cookie 3.0.6。@dune2/cli 同时从 Babel 系类型生成器切换到 @fumari/json-schema-ts 的输出（数组 Items 描述会出现在文档注释中）。

## 2.0.0

### Major Changes

- 380bc26: Upgrade the Babel integration to Babel 8 and publish ESM-only entry points.

## 1.0.4

### Patch Changes

- 40b6602: Fix createStore transform for `useSnapshot()` member initializer expressions (e.g. `const entries = store.useSnapshot().entries`) so they are rewritten to `useShallowSnapshot` with a generated selector. Added fixture and unit coverage for this case.
- e3be89a: Fix package export metadata, align React-related peers, and harden API generation for JSON-compatible 200 responses.

## 1.0.3

### Patch Changes

- c574bc0: fix(babel): selector 函数插入位置错误，当 useSnapshot 在箭头函数回调内时会崩溃

## 1.0.2

### Patch Changes

- 6fc2d4d: fix: stop collecting member expression chain at method calls in createStore plugin
- 645c192: fix: hoist generated `_selector_` function outside component to avoid re-creation on every render
- afe45fe: feat: use access path as selector property name (e.g. `a`, `"c.name"`) instead of generated `_prop_` identifiers
