# @dune2/tools

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
