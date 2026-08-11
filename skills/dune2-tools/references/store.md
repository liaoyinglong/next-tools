# Store APIs

Use this reference for application state built with `createStore`, Valtio snapshots, selectors, subscriptions, and safely passing store data to other components or libraries.

## Import

```ts
import { createStore, snapshot } from '@dune2/tools/store';
```

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

Prefer actions for mutations unless the consumer project intentionally uses direct `store.state` writes.

## React: useSnapshot

```tsx
function Counter() {
  const state = counterStore.useSnapshot();
  return <div>{state.count}</div>;
}
```

`useSnapshot()` uses Valtio proxy-based access tracking. It is convenient when a component naturally reads store properties directly.

## React: useShallowSnapshot

Use `useShallowSnapshot(selector)` when you want an explicitly selected ordinary value instead of a proxy-backed object:

```tsx
const { count, user } = counterStore.useShallowSnapshot((state) => ({
  count: state.count,
  user: state.user,
}));
```

This is especially useful when selected objects/arrays are passed to child components or third-party code that expects ordinary values.

## Passing snapshot values to other code

Do not blindly pass nested proxy-backed values from `useSnapshot()` to libraries that serialize, clone, compare, or otherwise expect plain objects.

Prefer `useShallowSnapshot` when practical. If you are already using `useSnapshot`, convert a value with `snapshot(...)` when an ordinary value is required:

```tsx
function Parent() {
  const state = counterStore.useSnapshot();
  return <Child user={snapshot(state.user)} />;
}
```

## Non-React reads and subscriptions

Use `getState()` when code needs the current state snapshot without subscribing through React:

```ts
const current = counterStore.getState();
```

Use `subscribe()` for imperative observers:

```ts
const unsubscribe = counterStore.subscribe((state) => {
  console.log(state);
});

unsubscribe();
```

## Existing Babel optimization

Some consumer projects may use `@dune2/babel` to optimize `useSnapshot` access into `useShallowSnapshot` selectors at build time. Before manually rewriting established store usage for performance, check the project's Babel/build configuration and existing conventions.

## Agent guidance

When a consumer project already uses `createStore`:

1. Extend the nearest existing store rather than introducing a parallel state library for the same domain.
2. Put mutations in `actionsCreator` unless local conventions deliberately allow direct state writes.
3. Use `useSnapshot()` for normal tracked component reads.
4. Prefer `useShallowSnapshot()` or `snapshot()` when ordinary values must cross component/library boundaries.
5. Use `getState()`/`subscribe()` outside React rather than inventing another synchronization layer.
