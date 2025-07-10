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

This project uses pnpm for package management and Lerna for monorepo management.

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
- `pnpm run test` - Run tests for all @dune2/\* packages
- `pnpm run release` - Run tests and publish new versions

## Documentation

The [docs](./docs) folder contains a Next.js documentation site with examples and API references for all tools.
