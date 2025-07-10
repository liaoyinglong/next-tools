# @dune2/tools

React utility library with common tools and components.

## Installation

```bash
npm install @dune2/tools
```

## Modules

### Factory

React state management utilities for creating context providers.

```typescript
import { createStateContext } from "@dune2/tools/factory/createStateContext";

const { Provider, useContextValue } = createStateContext({
  name: "Counter",
  useValueHooks: ({ initialCount = 0 }) => {
    const [count, setCount] = useState(initialCount);
    return { count, setCount };
  },
});
```

### Storage

Browser storage wrapper with React hooks integration.

```typescript
import { createStorage } from "@dune2/tools/storage";

class DataMap {
  token = "";
  user = null;
}

const storage = createStorage({
  DataMap,
  namespace: "app",
  storageType: "local", // or 'session'
});

// Use in React
const token = storage.token.useValue();
```

### RQ (React Query)

Enhanced React Query utilities with built-in request building.

```typescript
import { RequestBuilder } from "@dune2/tools/rq";

const userApi = new RequestBuilder({
  url: "/api/users/{id}",
  method: "get",
  urlPathParams: ["id"],
});

// Use in components
const { data, isLoading } = userApi.useQuery({ id: "123" });
```

### Store

Valtio-based state management with TypeScript support.

```typescript
import { createStore } from "@dune2/tools/store";

const counterStore = createStore({
  name: "counter",
  state: { count: 0 },
  actionsCreator: (state) => ({
    increment: () => state.count++,
    decrement: () => state.count--,
  }),
});

// Use in components
const { count } = counterStore.useSnapshot();
```

### Numbro

BigNumber.js wrapper for precise number formatting and calculations.

```typescript
import { numbro } from "@dune2/tools/numbro";

const price = numbro(123.456);
price.format({ mantissa: 2 }); // "123.46"
price.formatCurrency({ symbol: "$" }); // "$123.46"
```

### Shared

TypeScript utility types for better type safety.

```typescript
import type { OptionalKeys, Overwrite, Print } from "@dune2/tools/shared";
```
