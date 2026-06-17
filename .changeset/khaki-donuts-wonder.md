---
'@dune2/cli': patch
---

fix type generation by stripping schema `default` values before compile to avoid invalid intersections like `number & string`.
