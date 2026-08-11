# Factory APIs

Use this reference for React Context factories, prop adapters/defaults, and typed field-name helpers.

## Imports

```ts
import { createStateContext } from '@dune2/tools/factory/createStateContext';
import { mapProps } from '@dune2/tools/factory/mapProps';
import { fieldsMap, type FieldsMap } from '@dune2/tools/factory/fieldsMap';
```

## createStateContext

Use `createStateContext` when a Context value naturally comes from a custom hook and you want the Provider/accessor boilerplate generated consistently.

```tsx
function useCounter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  return { count, setCount };
}

const CounterContext = createStateContext({
  name: 'Counter',
  useValueHooks: useCounter,
});
```

Use the generated Provider and accessor hook:

```tsx
function App() {
  return (
    <CounterContext.Provider initial={1}>
      <Counter />
    </CounterContext.Provider>
  );
}

function Counter() {
  const { count, setCount } = CounterContext.useContextValue();
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

Returned helpers include:

- `Provider`
- `useContextValue`
- `withProvider`
- raw `Context`
- `use` for React 19 context consumption

Before manually creating a Context + Provider + accessor hook + HOC for hook-derived state, check whether `createStateContext` already fits.

## mapProps

Use `mapProps` when a component mainly needs reusable prop defaults, prop adaptation, derived props, or a lightweight wrapper that preserves refs.

### Static defaults

```tsx
const DangerButton = mapProps(Button, { variant: 'danger' });
```

### Derived/adapted props

```tsx
const ModernInput = mapProps(
  LegacyInput,
  (props: { value: string; onChange: (value: string) => void }) => ({
    text: props.value,
    onTextChange: props.onChange,
  }),
);
```

### Guidance

Consider `mapProps` before adding a component whose main purpose is only to:

- rename props
- supply defaults
- derive one prop from another
- inject consistent presentation props
- adapt a legacy component API

Do not use it when the wrapper has meaningful rendering/layout/business behavior of its own; a normal component may be clearer then.

## fieldsMap

`fieldsMap` returns an accessed property name as a string, while `FieldsMap<T>` provides typed field access.

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

Good uses include:

- table column `dataIndex`/keys
- form field names
- filter configuration
- allow/deny lists
- refactor-sensitive field-name configuration

It returns field names, not nested paths. Accessing a nested type does not automatically produce `profile.name`.

If a `RequestBuilder<Req, Res>` already exists, also check `api.reqFields` and `api.resFields` before casting the global `fieldsMap` manually.

## Agent guidance

1. Prefer `createStateContext` for hook-derived Context boilerplate.
2. Prefer `mapProps` for thin prop-only adapters/default wrappers.
3. Prefer `fieldsMap` or `reqFields`/`resFields` over duplicated field-name literals where refactor safety matters.
4. Follow existing application patterns; do not introduce these abstractions where a simple local implementation is clearer and the helper provides no benefit.
