# @dune2/tools

## 1.5.0

### Minor Changes

- d213541: 新增 `@dune2/tools/reducer` 子路径，提供 `defineReducer`：基于 React `useReducer` + immer 的组件内局部 reducer，action 内可直接修改 draft，payload 类型自动推导，返回新 state 可整体替换。`immer` 为可选 peer 依赖，仅使用该子路径时需要安装。

### Patch Changes

- 8426a31: 补充根目录 MIT LICENSE 文件，并把各包 `package.json` 的 `license` 字段统一为 `MIT`（`@dune2/tools` 此前为 ISC，其余包缺失该字段）。同时补充 `@dune2/babel` 的 readme，此前该包在 npm 上没有说明文档。仅元数据变更，不影响运行时行为。
- f5770cb: 仓库工程化整理：包级 `lint` 脚本改名为 `typecheck`（原本就是 `tsc` 类型检查），并新增根目录 `typecheck` 汇总命令；`@dune2/tools` 的类型级测试脚本单独命名为 `test:types`。仅脚本命名变更，不影响发布产物。

## 1.4.2

### Patch Changes

- b00beff: Compile JSX with React's automatic JSX runtime.

## 1.4.1

### Patch Changes

- 7cdd20b: Publish compiled ESM output and type declarations for reliable package exports.
- 0149706: Declare `@dune2/tools` as an ES module package.

## 1.4.0

### Minor Changes

- acbe3cc: 补充包元数据：声明 `react` peerDependencies（`^18 || ^19`）与 `sideEffects: false`，完善 description/keywords。运行时代码无变化。

  内部调整：`RequestBuilder` 的普通入口与 react-server 入口改为共享 `RequestBuilderBase`（请求构造、url 参数替换、queryKey 生成只有一份实现），对外 API 与运行时行为不变。

### Patch Changes

- acbe3cc: 升级构建与运行时依赖：changesets 3、oxfmt 0.67、vitest 5、tsdown 0.23（`inlineOnly` 迁移为 `deps.onlyBundle`）、swagger-parser 13、@ast-grep/napi 0.45、magic-string 1、publint 0.3.24、@types/js-cookie 3.0.6。@dune2/cli 同时从 Babel 系类型生成器切换到 @fumari/json-schema-ts 的输出（数组 Items 描述会出现在文档注释中）。

## 1.3.5

### Patch Changes

- fd56ba5: Upgrade bignumber.js to 11.1.5 while preserving Numbro's handling of invalid inputs, and publish the es-toolkit production dependency range as ^1.50.0.

## 1.3.4

### Patch Changes

- e3be89a: Fix package export metadata, align React-related peers, and harden API generation for JSON-compatible 200 responses.

## 1.3.3

### Patch Changes

- 27c0ddd: fix(tools): select 的 data 参数类型应为 API 原始返回类型，而非 select 返回类型

## 1.3.2

### Patch Changes

- 9273d45: Fix `useQuery` type inference when using `placeholderData: keepPreviousData`

## 1.3.1

### Patch Changes

- 0c850bb: Export `snapshot` from store module for converting proxy objects to plain values
- c286885: Fix `useShallowSnapshot` return type to be non-nullable via non-null assertion

## 1.3.0

### Minor Changes

- 73d6ed0: 新增 `createStorageHelper` 工厂函数，支持运行时动态 key 的存储场景；`createStorage` 的 `namespace` 参数改为可选，不传时直接使用原始 key；导出 `StorageHelper` 类以便外部类型引用。

## 1.2.5

### Patch Changes

- 82c6d27: fix(tools): recurse into index signature value types in FieldsMap

## 1.2.4

### Patch Changes

- d2f16ed: fix(tools): prevent index signature keys from leaking into FieldsMap result

## 1.2.3

### Patch Changes

- 56a6946: Refactor `FieldsMap` type helpers for readability and fix the `fieldsMap` Proxy availability check.

## 1.2.2

### Patch Changes

- 99f3b9e: Fix `FieldsMap` cycle detection so nested array item fields are not skipped when the root type and item type share optional keys.

## 1.2.1

### Patch Changes

- 8aed962: Add `useSuspenseQuery` support to `RequestBuilder`, including matching option types and tests.

## 1.2.0

### Minor Changes

- e8d8796: refactor: replace static queryClient with queryClientFactory for request isolation
