# @dune2/babel

## 1.0.3

### Patch Changes

- c574bc0: fix(babel): selector 函数插入位置错误，当 useSnapshot 在箭头函数回调内时会崩溃

## 1.0.2

### Patch Changes

- 6fc2d4d: fix: stop collecting member expression chain at method calls in createStore plugin
- 645c192: fix: hoist generated `_selector_` function outside component to avoid re-creation on every render
- afe45fe: feat: use access path as selector property name (e.g. `a`, `"c.name"`) instead of generated `_prop_` identifiers
