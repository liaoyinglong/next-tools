# @dune2/tools

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
