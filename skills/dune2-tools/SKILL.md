---
name: dune2-tools
description: Guide coding agents working in applications that consume @dune2/tools. Use when @dune2/tools is installed and the task involves API requests or TanStack Query, browser/cookie storage, Valtio state, React Context factories, prop adapters, typed field names, or precise decimal formatting/calculation. Prefer the library's existing APIs over rebuilding equivalent helpers.
license: ISC
metadata:
  package: '@dune2/tools'
  repository: liaoyinglong/next-tools
---

# @dune2/tools consumer guide

This is a user-facing skill for projects that **consume** `@dune2/tools`. It is not contributor guidance for developing the `next-tools` repository itself.

Use the library's existing abstractions instead of rebuilding them with raw TanStack Query, storage listeners, Valtio boilerplate, Context boilerplate, prop wrapper components, string field constants, or floating-point helpers.

## First checks

1. Confirm the consumer project depends on `@dune2/tools` in its package manifest or lockfile.
2. Search the consumer codebase for existing `@dune2/tools/*` imports and generated API modules before adding a new abstraction.
3. Prefer the package's subpath exports. **Do not expect runtime utilities from `@dune2/tools` root**; import from paths such as `@dune2/tools/rq`, `@dune2/tools/storage`, `@dune2/tools/store`, `@dune2/tools/numbro`, or `@dune2/tools/factory/*`.
4. Match the application's existing request client, query client, namespaces, store conventions, and generated API patterns instead of introducing parallel infrastructure.
5. Read only the reference relevant to the current task.

## References

Load references progressively instead of reading every API guide up front:

- API requests, TanStack Query, cache operations, generated APIs, SDK/worker async operations: [references/rq.md](references/rq.md)
- localStorage, sessionStorage, React persistence subscriptions, cookies: [references/storage.md](references/storage.md)
- Valtio application state, snapshots, selectors, subscriptions: [references/store.md](references/store.md)
- React Context factories, prop adapters, typed field names: [references/factory.md](references/factory.md)
- Precise decimal arithmetic, currency/percentage/number formatting: [references/numbro.md](references/numbro.md)

Do not load unrelated references merely because `@dune2/tools` is present.

## Choose the existing primitive first

| Need | Prefer |
| --- | --- |
| HTTP API + TanStack Query | `RequestBuilder` from `@dune2/tools/rq` |
| SDK/contract/worker/local async operation that still needs Query caching/status | `createApi` from `@dune2/tools/rq/createApi` |
| Imperative request using an existing API definition | `api.request(...)` |
| Prefetch/fetch/ensure/invalidate/refetch/read/write query cache | The matching `RequestBuilder` method |
| Exceptional request needing separate query/body or per-call transport config | `requestWithConfig(...)`, only when `request(...)` cannot express it |
| Typed request/response field names | `api.reqFields`, `api.resFields`, or `fieldsMap` |
| localStorage/sessionStorage + typed defaults + React subscription | `createStorage` |
| Client-readable string cookies | `createCookieStorage` |
| Valtio state with typed actions/hooks | `createStore` |
| React Context whose value is produced by a hook | `createStateContext` |
| Adapt/default/enhance component props while preserving refs | `mapProps` |
| Precise decimal arithmetic/formatting | `numbro` / `Numbro` |

## High-value rules

- When an API is already represented by a `RequestBuilder`, use its query/mutation/cache methods instead of wrapping it in another raw TanStack Query layer or manually rebuilding its query key.
- Default to `api.request(params)` for imperative requests. `requestWithConfig(...)` is an escape hatch, not the normal calling style.
- Reuse the application's shared `RequestBuilder.setRequestFn(...)` and QueryClient configuration when present instead of creating per-endpoint infrastructure.
- Prefer `createStorage().<key>.useValue()` over custom local/session-storage React synchronization.
- Prefer existing `createStore` state/actions over introducing a parallel state mechanism for the same domain. Be careful when passing Valtio proxy-backed snapshots to code expecting plain objects.
- Prefer `createStateContext`, `mapProps`, and `fieldsMap` when their focused abstraction directly matches the problem; do not use them merely for consistency if a simpler local implementation is clearer.
- Use `numbro` for precise decimal business logic and established number formatting rather than native floating-point arithmetic plus ad-hoc `toFixed`/string formatting.

## Shared type utilities

For matching type-level tasks, reuse the package utilities instead of recreating equivalents:

```ts
import type { OptionalKeys, Overwrite, Print } from '@dune2/tools/shared';
```

## Consumer-project workflow

1. Identify the nearest existing `@dune2/tools` pattern in the application.
2. Load the single most relevant reference above when API details are needed.
3. Pick the smallest library primitive that directly covers the requirement.
4. Preserve generated API modules and shared global configuration; extend them rather than bypassing them.
5. Keep imports on documented/exported subpaths.
6. Run the consumer project's relevant typecheck/tests after changes.
7. If the library truly lacks the needed behavior, implement the smallest local gap and explicitly note why an existing `@dune2/tools` API was not sufficient.

## Common mistakes to avoid

- Importing utilities from the package root.
- Reading every reference file when the task only concerns one module.
- Recreating a TanStack Query `queryKey` for an existing `RequestBuilder` endpoint.
- Calling raw `fetch`/axios in a component when a generated or existing API builder already exists.
- Reaching for `requestWithConfig(...)` when ordinary `request(params)` is sufficient.
- Creating another storage hook around localStorage when `createStorage` already provides `useValue` and synchronization.
- Building string field-name constants manually when `fieldsMap` / `reqFields` / `resFields` can provide typed names.
- Passing proxy-backed store objects blindly into libraries that expect ordinary serializable values.
- Using JavaScript `number` arithmetic for precise decimal business logic when the codebase already uses `numbro`.
