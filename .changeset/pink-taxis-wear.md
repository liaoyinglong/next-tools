---
'@dune2/cli': patch
---

Fix request body type generation when an operation has only header or cookie parameters, or an empty parameters list. Preserve array and scalar body types instead of replacing them with an empty object type.
