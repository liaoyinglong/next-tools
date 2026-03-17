# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **pnpm workspaces + Turborepo monorepo** (`@dune2` scope) containing:

- `@dune2/tools` — React utility library (state, storage, i18n, number formatting, React Query wrappers)
- `@dune2/cli` — CLI for generating TypeScript API clients from Swagger/OpenAPI specs
- `@dune2/babel` — Babel utilities for AST-based store creation
- `docs` — Next.js documentation site (Fumadocs)

No databases, Docker, or external services are required. All tests are self-contained Vitest unit tests.

### Key commands

See `package.json` scripts at the root. Summary:

| Task               | Command                   |
| ------------------ | ------------------------- |
| Install deps       | `pnpm install`            |
| Build all packages | `pnpm run build`          |
| Run all tests      | `pnpm run test`           |
| Format check       | `pnpm run format:check`   |
| Auto-format        | `pnpm run format`         |
| Docs dev server    | `cd docs && pnpm run dev` |

### Gotchas

- **Node.js v24** is required (see `.nvmrc`). Use `nvm use 24` before running commands.
- **Build before test**: Turborepo's `test` task depends on `build` (see `turbo.json`), so `pnpm run test` will build first automatically.
- **Catalog syntax bug**: The `catalog:@types/debug` and `catalog:tsdown` entries in `packages/babel/package.json` and `packages/cli/package.json` are invalid pnpm catalog syntax (should be `catalog:`). This has been fixed in the environment setup commit. If you encounter `ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC`, verify these entries use `catalog:` (not `catalog:package-name`).
- **sharp build warning**: pnpm may warn about ignored `sharp` build scripts. This is non-blocking; `sharp` has been added to `onlyBuiltDependencies` in `pnpm-workspace.yaml`.
- The `@dune2/tools` package exports source `.ts`/`.tsx` files directly (no dist output), so the turbo warning about missing output files for `@dune2/tools#build` is expected.
- **Changeset format**: Do not hand-write changeset frontmatter in heading style like `## "@dune2/tools": patch`. Use `pnpm changeset` to generate it when possible. In non-TTY environments, use `pnpm changeset add --empty` and then fill the generated file with proper frontmatter:
  ```md
  ---
  '@dune2/tools': patch
  ---
  ```
  `pnpm changeset status` may still fail locally if the repo cannot find a diverged `main`, but that is separate from file format correctness.
