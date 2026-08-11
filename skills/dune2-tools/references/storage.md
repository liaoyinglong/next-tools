# Storage APIs

Use this reference for typed localStorage/sessionStorage access, React subscriptions to persistent values, cross-tab synchronization, and client-readable cookies.

## Imports

```ts
import { createStorage } from '@dune2/tools/storage';
import { createCookieStorage } from '@dune2/tools/storage/cookie';
```

## createStorage

Define defaults with a class, then create typed storage helpers.

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

Use `storageType: 'session'` for sessionStorage.

Each item exposes its own helper API:

```ts
storage.theme.get();
storage.theme.set('dark');
storage.theme.remove();
storage.theme.set(undefined); // also removes
storage.theme.key;
storage.theme.defaultValue;
```

### React subscription

Use `useValue()` instead of building a custom localStorage hook:

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

`createStorage` already coordinates storage values with React updates. Prefer this path over ad-hoc `storage` event listeners unless there is a demonstrated gap.

### Non-React subscription

```ts
const unsubscribe = storage.theme.subscribe(() => {
  console.log(storage.theme.get());
});

unsubscribe();
```

Use this when another subsystem needs to react to storage changes without a React hook.

### Namespace compatibility

The namespace becomes part of the persisted key. Preserve existing application naming conventions when changing or extending storage definitions.

An omitted or empty namespace changes the key shape, so do not casually add/remove a namespace in an application with existing persisted data.

### Defaults and objects

The `DataMap` class provides the typed default values for each storage item. Reuse the existing application's `DataMap` and storage instance when one already exists instead of creating parallel storage namespaces.

## createCookieStorage

Use `createCookieStorage` for small client-readable string values stored in cookies.

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

Cookie options are passed through to `js-cookie`.

Important constraints:

- Cookie values are strings.
- Keep cookie payloads small.
- Browser JavaScript cannot create `HttpOnly` cookies.
- Do not treat this helper as a replacement for server-managed authentication cookies.

## Agent guidance

Prefer existing storage abstractions in this order:

1. Reuse an existing application `createStorage`/`createCookieStorage` instance.
2. Extend its `DataMap` when the new value belongs to the same storage domain.
3. Use `useValue()` in React and `subscribe()` outside React.
4. Only fall back to direct Web Storage/cookie handling when the helper genuinely cannot express the requirement.
