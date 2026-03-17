---
'@dune2/tools': patch
---

Fix `FieldsMap` cycle detection so nested array item fields are not skipped when the root type and item type share optional keys.
