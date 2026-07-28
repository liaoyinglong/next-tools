# @dune2/cli

## 1.2.7

### Patch Changes

- 0d2180f: Replace `json-schema-to-typescript` with `@fumari/json-schema-ts` for API type generation.
- b98ce4a: Flatten object schemas referenced by query parameters when generating request types.

## 1.2.6

### Patch Changes

- e3be89a: Fix package export metadata, align React-related peers, and harden API generation for JSON-compatible 200 responses.

## 1.2.5

### Patch Changes

- a1bd65b: perf(generateApi): 大幅提升 API 生成速度

  - 编译类型时只挂载可达的 `$ref` 定义，替代原来把整份 `components`/`definitions` 挂到每个 schema 上的做法，避免 `json-schema-to-typescript` 每次都全量遍历类型图
  - 关闭 `compile` 内置的 prettier 格式化（生成后统一由 `codeFormatterCmd` 格式化）

  在 261 个接口的 swagger 上，端到端耗时从 ~18.6s 降至 ~0.5s，类型输出结构保持不变。

## 1.2.4

### Patch Changes

- 58d02c6: fix type generation by stripping schema `default` values before compile to avoid invalid intersections like `number & string`.

## 1.2.3

### Patch Changes

- 9be188f: 修复同时包含请求体和路径参数的接口生成结果，确保路径参数不会丢失。

## 1.2.2

### Patch Changes

- 0bba693: fix: swagger-parser fails to resolve remote HTTP URLs, pre-fetch JSON before bundling

## 1.2.1

### Patch Changes

- da5c9e1: Fix Swagger v2 support in `generateApi` by handling `#/definitions/*` refs during type generation and supporting `response.schema` responses.

## 1.2.0

### Minor Changes

- 9914d16: upgrade deps
