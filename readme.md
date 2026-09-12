# Next Tools

A monorepo containing various tools and utilities for modern web development.

## Packages

### [@dune2/babel](./packages/babel)

Babel utilities and plugins for code transformation.

### [@dune2/cli](./packages/cli)

Command line interface for development tools.

### [@dune2/tools](./packages/tools)

React utility library with common tools and components.

## Development

This project uses pnpm workspaces and Turborepo for monorepo task orchestration.

### Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test
```

### Commands

- `pnpm run build` - Build all @dune2/\* packages
- `pnpm run build:docs` - Build the docs workspace
- `pnpm run test` - Run tests for all @dune2/\* packages
<<<<<<< HEAD
- `pnpm run test:docs` - Run docs workspace tests
=======
- `pnpm run check:exports` - Check every package's exports map and type declarations (publint + attw)
>>>>>>> 2864ade (feat(example): add a runnable Next.js app for tools store/storage/rq)
- `pnpm run release` - Run tests and publish new versions

## Examples

- [example/next-tools-app](./example/next-tools-app) — 可运行的 Next.js 示例，演示 `@dune2/tools` 的 store / storage / rq
- [example/cli-api-gen](./example/cli-api-gen) — `@dune2/cli` 的本地演练目录（需要自己放入 swagger 文件）

## Documentation

The [docs](./docs) folder contains a Vite + TanStack Start + Fumadocs site with examples and API references for all tools.
