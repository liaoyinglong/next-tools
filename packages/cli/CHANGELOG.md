# @dune2/cli

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
