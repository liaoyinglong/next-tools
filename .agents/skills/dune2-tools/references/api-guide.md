# @dune2/tools API guide

Use this reference when choosing an existing `@dune2/tools` abstraction. Prefer project-local examples and generated API definitions when they differ from these generic examples.

## Import map

```ts
import { RequestBuilder } from '@dune2/tools/rq';
import { createApi } from '@dune2/tools/rq/createApi';
import { createStorage } from '@dune2/tools/storage';
import { createCookieStorage } from '@dune2/tools/storage/cookie';
import { createStore, snapshot } from '@dune2/tools/store';
import { numbro, Numbro } from '@dune2/tools/numbro';
import { createStateContext } from '@dune2/tools/factory/createStateContext';
import { mapProps } from '@dune2/tools/factory/mapProps';
import { fieldsMap, type FieldsMap } from '@dune2/tools/factory/fieldsMap';
```

The package root is not the utility barrel. Use exported subpaths.

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

For `get`, `head`, and `options`, `request(params)` sends remaining request values as query params. For other methods, it sends them as request data/body. Path params listed in `urlPathParams` are removed from params/data and substituted into `{name}` placeholders.

### React hooks

```ts
const query = userApi.useQuery({ id: '123', includeProfile: true });
const suspenseQuery = userApi.useSuspenseQuery({ id: '123' });

const mutation = updateUserApi.useMutation({
  onSuccess: () => userApi.invalidateQuery({ id: '123' }),
});
```

Do not wrap an existing builder in raw `useQuery`/`useMutation` unless the builder API cannot express the required behavior.

### Imperative request and QueryClient methods

```ts
// Direct transport request, without intentionally using QueryClient cache APIs.
const user = await userApi.request({ id: '123' });

// QueryClient-backed operations using the builder's own key/query function.
await userApi.prefetchQuery({ id: '123' });
const fetched = await userApi.fetchQuery({ id: '123' });
const ensured = await userApi.ensureQueryData({ id: '123' });

const cached = userApi.getQueryData({ id: '123' });
userApi.setQueryData({ id: '123' }, nextUser);
await userApi.invalidateQuery({ id: '123' });
await userApi.refetchQueries({ id: '123' });
```

These methods preserve the builder's query key. Prefer them over manually reconstructing `[url, method, params]`.

### requestWithConfig

Use it when `request(params)` is too simple, especially when a request needs both query params and body data.

```ts
await searchApi.requestWithConfig({
  params: { page: 1 },
  data: { filters: ['active'] },
  headers: { 'x-request-source': 'dashboard' },
});
```

It can also carry request metadata, signals, and an override `requestFn` through the builder request config.

### Shared request function

A project can configure transport once:

```ts
RequestBuilder.setRequestFn(async (config) => {
  return requestClient(config);
});
```

Before adding per-endpoint fetch/axios logic, search for an existing `setRequestFn` setup.

### QueryClient selection and SSR

A builder resolves a QueryClient in this order:

1. method call option (`{ queryClient }`)
2. builder constructor option
3. `RequestBuilder.queryClientFactory`

For SSR, prefer a per-request factory when the app already uses that design:

```ts
RequestBuilder.setQueryClientFactory(() => getRequestScopedQueryClient());
```

Avoid introducing a process-global QueryClient shared across users.

### Typed fields

Every `RequestBuilder<Req, Res>` exposes:

```ts
userApi.reqFields;
userApi.resFields;
```

Use these for request/response field-name strings in tables/forms/configuration instead of duplicating literal strings when appropriate.

### Infinite query

`useInfiniteQuery` is available for page-based endpoints. Its built-in behavior reads `pageSize`, advances `pageNum`, and flattens page `result` arrays into `data`; the original InfiniteData remains available as `rawData`.

If an endpoint uses a different pagination shape, supply compatible TanStack Query options or do not force it into this helper.

## createApi

Use `createApi` when the operation is not a normal HTTP request but still benefits from `RequestBuilder`/TanStack Query behavior.

Good fits include SDK calls, contract methods, WebWorkers, and cached local async computation.

```ts
const accountApi = createApi<{ id: string }, Account>({
  queryKey: 'sdk.account',
  requestFn: ({ id }) => sdk.getAccount(id),
});

const { data } = accountApi.useQuery({ id: '42' });
```

The returned value is still a `RequestBuilder`, so its cache and mutation methods remain available.

## fieldsMap

`fieldsMap` returns the accessed property name as a string while `FieldsMap<T>` provides typed field access.

```ts
type User = {
  id: string;
  profile: {
    name: string;
  };
};

const userFields = fieldsMap as FieldsMap<User>;
userFields.id; // 'id'
userFields.name; // 'name'
```

Use it for table columns, form field names, allow/deny lists, filter configuration, and similar refactor-sensitive field strings.

It returns names, not nested paths: accessing a nested type does not automatically create `profile.name`.

## createStorage

Define defaults with a class, then create typed local/session storage helpers.

```ts
class DataMap {
  token = '';
  theme = 'light';
  user = { id: '', name: '' };
}

const storage = createStorage({
  DataMap,
  namespace: 'app',
  storageType: 'local',
});
```

Each item supports:

```ts
storage.theme.get();
storage.theme.set('dark');
storage.theme.remove();
storage.theme.set(undefined); // also removes
storage.theme.key;
storage.theme.defaultValue;

const unsubscribe = storage.theme.subscribe(() => {
  console.log(storage.theme.get());
});
```

In React:

```tsx
function ThemeButton() {
  const theme = storage.theme.useValue();
  return (
    <button onClick={() => storage.theme.set(theme === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  );
}
```

`useValue` is the preferred React subscription path. `createStorage` also handles same-app update notifications and browser storage synchronization; do not rebuild that with ad-hoc `storage` event hooks unless there is a demonstrated gap.

Use `storageType: 'session'` for sessionStorage. An empty/omitted namespace changes the key naming behavior, so preserve the project's compatibility requirements.

## createCookieStorage

```ts
class CookieMap {
  theme = 'light';
}

const cookie = createCookieStorage({
  DataMap: CookieMap,
  namespace: 'app',
});

cookie.theme.get();
cookie.theme.set('dark', { expires: 7, sameSite: 'lax' });
cookie.theme.remove();
```

Cookie values are strings and options are passed to `js-cookie`. Use this only for client-readable cookies. It cannot create an `HttpOnly` cookie from browser JavaScript.

## createStore

```ts
const counterStore = createStore({
  name: 'counter',
  state: {
    count: 0,
    user: { name: 'Ada' },
  },
  actionsCreator: (state) => ({
    increment: () => state.count++,
    setName: (name: string) => {
      state.user.name = name;
    },
  }),
});
```

Useful APIs:

```ts
counterStore.state;
counterStore.initialState;
counterStore.getState();
counterStore.actions.increment();
counterStore.subscribe((state) => console.log(state));
```

In React:

```tsx
const state = counterStore.useSnapshot();

const { count, user } = counterStore.useShallowSnapshot((s) => ({
  count: s.count,
  user: s.user,
}));
```

`useSnapshot` uses Valtio proxy tracking. `useShallowSnapshot` returns ordinary selected values and can be safer for values passed to child components or third-party code.

If using `useSnapshot` and an ordinary object is required:

```tsx
const state = counterStore.useSnapshot();
return <Child user={snapshot(state.user)} />;
```

Prefer actions for mutations unless the repository intentionally uses direct `store.state` writes.

## createStateContext

Use when a Context's value naturally comes from a custom hook.

```tsx
function useCounter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  return { count, setCount };
}

const CounterContext = createStateContext({
  name: 'Counter',
  useValueHooks: useCounter,
});

function App() {
  return (
    <CounterContext.Provider initial={1}>
      <Counter />
    </CounterContext.Provider>
  );
}
```

Returned helpers include `Provider`, `useContextValue`, `withProvider`, the raw `Context`, and `use` for React 19 context consumption.

## mapProps

Use `mapProps` to adapt or add props without creating boilerplate wrappers. It handles ref forwarding.

Static defaults:

```tsx
const DangerButton = mapProps(Button, { variant: 'danger' });
```

Derived/adapted props:

```tsx
const ModernInput = mapProps(
  LegacyInput,
  (props: { value: string; onChange: (value: string) => void }) => ({
    text: props.value,
    onTextChange: props.onChange,
  }),
);
```

Before writing a component whose only job is renaming/defaulting/deriving props, consider `mapProps`.

## numbro / Numbro

Use for decimal arithmetic and consistent formatting rather than `toFixed` plus floating-point business logic.

```ts
numbro('1,234.56').format({ mantissa: 2, thousandSeparated: true });
numbro(0.1234).format({ output: 'percent', mantissa: 1 });
numbro(1234567).format({ average: true, mantissa: 2 });
```

The wrapper is based on BigNumber.js and supports chainable precise operations and configurable rounding. Search existing code for project-specific formatting options before inventing new display rules.

## Type utilities

```ts
import type { OptionalKeys, Overwrite, Print } from '@dune2/tools/shared';
```

Use these when the local type-level task matches them instead of recreating equivalent helper types.
