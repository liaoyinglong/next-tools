# @dune2/babel

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
