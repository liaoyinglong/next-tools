# @dune2/babel

## 1.0.4

### Patch Changes

- 40b6602: Fix createStore transform for `useSnapshot()` member initializer expressions (e.g. `const entries = store.useSnapshot().entries`) so they are rewritten to `useShallowSnapshot` with a generated selector. Added fixture and unit coverage for this case.
- e3be89a: Fix package export metadata, align React-related peers, and harden API generation for JSON-compatible 200 responses.

## 1.0.3

### Patch Changes

- c574bc0: fix(babel): selector 函数插入位置错误，当 useSnapshot 在箭头函数回调内时会崩溃

## 1.0.2

### Patch Changes

- 6fc2d4d: fix: stop collecting member expression chain at method calls in createStore plugin
- 645c192: fix: hoist generated `_selector_` function outside component to avoid re-creation on every render
- afe45fe: feat: use access path as selector property name (e.g. `a`, `"c.name"`) instead of generated `_prop_` identifiers
