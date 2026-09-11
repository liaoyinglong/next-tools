# cli-api-gen example

This directory is a local playground for `@dune2/cli`, not a self-contained
example. The `dune.config.ts` points at `./src/swagger/*.json` inputs and
outputs to `./src/apis/*`, both of which are gitignored.

To use it:

1. Put your Swagger/OpenAPI JSON files under `./src/swagger/` (or edit
   `dune.config.ts` to point at remote URLs).
2. Run:

```bash
pnpm dune generateApi
```

Generated files land in `./src/apis/` and stay untracked.
