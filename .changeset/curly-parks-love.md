---
'@dune2/babel': patch
---

Fix createStore transform for `useSnapshot()` member initializer expressions (e.g. `const entries = store.useSnapshot().entries`) so they are rewritten to `useShallowSnapshot` with a generated selector. Added fixture and unit coverage for this case.
