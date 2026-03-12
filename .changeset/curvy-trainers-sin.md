---
'@dune2/cli': patch
---

Fix Swagger v2 support in `generateApi` by handling `#/definitions/*` refs during type generation and supporting `response.schema` responses.
