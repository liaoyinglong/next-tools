# @dune2/vite

## 0.2.0

### Minor Changes

- 21b9593: Add server-only and client-only function transforms for Vite builds, including consumer-aware isomorphic transform handling.

  Refactor transform rule execution into a unified engine to simplify plugin behavior and improve maintainability.

  Migrate plugin tests to fixture-based coverage and add focused scenarios for server/client/isomorphic resolution paths.

## 0.1.1

### Patch Changes

- b7e37cc: use Vite hook filter for transform to reduce unnecessary hook invocations
