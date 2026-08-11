# Request and TanStack Query APIs

Use this reference for HTTP APIs, TanStack Query integration, generated API modules, cache operations, and non-HTTP async operations that should still use Query semantics.

## Imports

```ts
import { RequestBuilder } from '@dune2/tools/rq';
import { createApi } from '@dune2/tools/rq/createApi';
```

## RequestBuilder

### Define an endpoint

```ts
interface UserParams {
  id: string;
  includeProfile?: boolean;
}

interface User {
  id: string;
  name: string;
}

const userApi = new RequestBuilder<UserParams, User>({
  url: '/api/users/{id}',
  method: 'get',
  urlPathParams: ['id'],
});
```

For `get`, `head`, and `options`, `request(params)` sends remaining values as query params. For other methods it sends them as request data/body. Entries in `urlPathParams` are removed from params/data and substituted into `{name}` placeholders.

### Prefer the builder's React hooks

```ts
const query = userApi.useQuery({ id: '123', includeProfile: true });
const suspenseQuery = userApi.useSuspenseQuery({ id: '123' });

const mutation = updateUserApi.useMutation({
  onSuccess: () => userApi.invalidateQuery({ id: '123' }),
});
```

When an endpoint is already represented by a `RequestBuilder`, do not wrap it in another raw `useQuery` or `useMutation` unless the builder truly cannot express the required behavior.

### Imperative requests and cache-aware operations

Use `request` for a direct transport request:

```ts
const user = await userApi.request({ id: '123' });
```

Use the QueryClient-backed methods when cache semantics are desired:

```ts
await userApi.prefetchQuery({ id: '123' });
const fetched = await userApi.fetchQuery({ id: '123' });
const ensured = await userApi.ensureQueryData({ id: '123' });

const cached = userApi.getQueryData({ id: '123' });
userApi.setQueryData({ id: '123' }, nextUser);
await userApi.invalidateQuery({ id: '123' });
await userApi.refetchQueries({ id: '123' });
```

These methods preserve the builder's query key and query function. Prefer them over manually reconstructing `[url, method, params]`.

### `requestWithConfig` is an escape hatch

Default to `request(params)`. `requestWithConfig(...)` is generally not recommended for ordinary endpoint calls.

Use it only when a real endpoint requirement cannot be expressed cleanly through `request(...)`, such as a request that genuinely needs separately controlled query params and body data or a per-call transport override.

```ts
await searchApi.requestWithConfig({
  params: { page: 1 },
  data: { filters: ['active'] },
  headers: { 'x-request-source': 'dashboard' },
});
```

Do not use it merely to pass normal GET params or normal mutation data. Follow established consumer-project patterns when they exist.

### Shared request function

A consumer application can configure transport once:

```ts
RequestBuilder.setRequestFn(async (config) => {
  return requestClient(config);
});
```

Before adding per-endpoint `fetch`/axios logic, search for an existing `setRequestFn` setup.

### QueryClient selection and SSR

A builder resolves a QueryClient in this order:

1. method-call option (`{ queryClient }`)
2. builder constructor option
3. `RequestBuilder.queryClientFactory`

For SSR, use a request-scoped QueryClient when the application follows that design:

```ts
RequestBuilder.setQueryClientFactory(() => getRequestScopedQueryClient());
```

Do not introduce a process-global QueryClient shared across users.

### Typed fields

Every `RequestBuilder<Req, Res>` exposes typed request/response field maps:

```ts
userApi.reqFields;
userApi.resFields;
```

Use them for table, form, filter, and configuration field names instead of duplicating string literals when appropriate.

### Infinite query

`useInfiniteQuery` is available for page-based endpoints. Its built-in behavior reads `pageSize`, advances `pageNum`, flattens page `result` arrays into `data`, and keeps the original InfiniteData in `rawData`.

If an endpoint uses a substantially different pagination contract, do not force it into this helper.

## createApi

Use `createApi` when an operation is not a normal HTTP request but still benefits from `RequestBuilder` and TanStack Query behavior.

Good fits include SDK calls, contract methods, WebWorkers, and cached local async computation.

```ts
const accountApi = createApi<{ id: string }, Account>({
  queryKey: 'sdk.account',
  requestFn: ({ id }) => sdk.getAccount(id),
});

const { data } = accountApi.useQuery({ id: '42' });
```

The returned value is still a `RequestBuilder`, so its query, mutation, cache, and imperative APIs remain available.
