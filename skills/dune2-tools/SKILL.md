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
5. Read [references/api-guide.md](references/api-guide.md) when the task touches one of the modules below or when you are unsure whether the library already has an API for the job.

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

## RequestBuilder rules

When an API is already represented by a `RequestBuilder`, use its methods instead of wrapping it in another `useQuery`, `useMutation`, or hand-built `queryKey`.

- Component query: `api.useQuery(params, options)` or `api.useSuspenseQuery(params, options)`.
- Mutation: `api.useMutation(options)`.
- Infinite pagination: `api.useInfiniteQuery(params, options)` when the response shape and pagination contract fit.
- Outside React: `api.request(params)`, `api.fetchQuery(params)`, `api.ensureQueryData(params)`, or `api.prefetchQuery(params)` depending on whether Query cache semantics are wanted.
- Cache operations: `getQueryData`, `setQueryData`, `invalidateQuery`, `refetchQueries`.
- **Default to `request(params)`. `requestWithConfig(...)` is generally not recommended for normal calls.** Use it only when the endpoint genuinely needs separate query/body data, per-call headers/signal, or another request configuration that `request(...)` cannot express cleanly.
- URL placeholders: define `urlPathParams`; do not manually duplicate path replacement at call sites.
- Configure a shared transport with `RequestBuilder.setRequestFn(...)` when the application already follows that model. Avoid assigning a one-off request function to every API without a reason.
- In SSR, do not share one request-global `QueryClient` across users. Reuse the application's `RequestBuilder.setQueryClientFactory(...)` pattern when present.

## State and storage rules

- For persistent browser values, prefer `createStorage` over direct `localStorage`/`sessionStorage` reads plus custom React synchronization. Use each helper's `get`, `set`, `remove`, `useValue`, and `subscribe` methods.
- For cookie-backed client-readable strings, use `createCookieStorage` if the application uses it. Do not treat it as a replacement for server-set `HttpOnly` authentication cookies.
- For app state already modeled with `createStore`, mutate through `store.actions` unless the local code intentionally uses direct `store.state` writes.
- `store.useSnapshot()` returns Valtio proxy-backed snapshots. When passing selected object/array state to third-party or child components, prefer the application's `useShallowSnapshot(...)` pattern or convert with `snapshot(...)` when needed.
- For a scoped React state provider built from hooks, prefer `createStateContext` rather than manually creating a Context + Provider + accessor hook + HOC.

## Factory and number rules

- Use `mapProps` for reusable prop defaults, prop adaptation, prop-derived enhancement, and ref-preserving wrapper components before creating repetitive wrapper components.
- Use `fieldsMap` (or `RequestBuilder.reqFields/resFields`) for refactor-safe field-name strings used by tables, forms, filters, field lists, and generated API consumers.
- Use `numbro` for money, token amounts, rates, percentages, or other decimal operations where plain JavaScript floating point or ad-hoc formatting would be risky or inconsistent.

## Consumer-project workflow

1. Identify the nearest existing `@dune2/tools` pattern in the application.
2. Pick the smallest library primitive that directly covers the requirement.
3. Preserve generated API modules and shared global configuration; extend them rather than bypassing them.
4. Keep imports on documented/exported subpaths.
5. Run the consumer project's relevant typecheck/tests after changes.
6. If the library truly lacks the needed behavior, implement the smallest local gap and explicitly note why an existing `@dune2/tools` API was not sufficient.

## Common mistakes to avoid

- Importing utilities from the package root.
- Recreating a TanStack Query `queryKey` for an existing `RequestBuilder` endpoint.
- Calling raw `fetch`/axios in a component when a generated or existing API builder already exists.
- Reaching for `requestWithConfig(...)` when ordinary `request(params)` is sufficient.
- Creating another storage hook around `localStorage` when `createStorage` already provides `useValue` and cross-tab updates.
- Building string field-name constants manually when `fieldsMap` / `reqFields` / `resFields` can provide typed names.
- Passing proxy-backed store objects blindly into libraries that expect ordinary serializable values.
- Using JavaScript `number` arithmetic for precise decimal business logic when the codebase already uses `numbro`.
