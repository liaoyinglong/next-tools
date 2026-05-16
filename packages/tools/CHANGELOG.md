# @dune2/tools

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
