# AGENTS.md

## Overview

pnpm workspaces + Turborepo monorepo（`@dune2` scope）：

- `@dune2/tools` — React 工具库：react-query 请求构建器、storage、valtio store、数字格式化
- `@dune2/cli` — 从 Swagger/OpenAPI 生成 TypeScript API 客户端的 CLI
- `@dune2/babel` — 基于 AST 的 store 生成 Babel 工具
- `@dune2/vite` — Vite 插件（ast-grep 变换）
- `@dune2/test-utils` — 内部共享的 fixture 测试运行器（private，不发布）
- `docs` — Vite + TanStack Start + Fumadocs 文档站
- `example/*` — 可运行示例（Next.js app、CLI 演练目录）

没有数据库、Docker 或外部服务依赖。测试都是自包含的 Vitest 单元测试。

## Key commands

| Task                  | Command                                     |
| --------------------- | ------------------------------------------- |
| 安装依赖              | `pnpm install`                              |
| 构建全部包            | `pnpm run build`                            |
| 运行全部测试          | `pnpm run test`                             |
| 类型检查              | `pnpm run typecheck`                        |
| Lint（oxlint）        | `pnpm run lint`                             |
| 格式检查 / 自动格式化 | `pnpm run format:check` / `pnpm run format` |
| 校验包导出与类型声明  | `pnpm run check:exports`                    |
| 文档站开发            | `cd docs && pnpm run dev`                   |

## Gotchas

- **Node.js v24** 是必需的（见 `.nvmrc`）。先 `nvm use 24`。
- **test 依赖 build**：`turbo.json` 里 `test` 任务声明了 `dependsOn: ["build"]`，所以 `pnpm run test` 会自动先构建。
- **换行符**：仓库有 `.gitattributes` 强制 `eol=lf`。Windows 上不要开启 `core.autocrlf=input` 之外的例外设置，否则 `format:check` 会整仓库报错。
- **临时文件放 `.local/`**：一次性脚本、探测文件、试验产物都放这里（已 gitignore），不要污染仓库根目录。
- **包级 `typecheck` 脚本**：每个包的 `typecheck` 是 `tsc`（`@dune2/tools` 走 `tsc --diagnostics`，类型级测试另见其 `test:types`）。根目录 `pnpm run typecheck` 通过 turbo 汇总执行。
- **pnpm 12 的构建脚本白名单是 `allowBuilds`**（不是旧版的 `onlyBuiltDependencies`），配置在 `pnpm-workspace.yaml`。
- **`minimumReleaseAge` 已启用**（1440 分钟）：新发布的依赖要等一天才会被安装。确实需要立刻用某个刚发布的包时，加进 `minimumReleaseAgeExclude`。
- **Changeset 格式**：不要手写 `## "@dune2/tools": patch` 这种标题式 frontmatter。优先用 `pnpm changeset`；非 TTY 环境用 `pnpm changeset add --empty` 再补内容：
  ```md
  ---
  '@dune2/tools': patch
  ---
  ```
  `baseBranch` 是 `develop`。
- **`@dune2/tools` 会构建到 `dist`**（`files: ["dist"]`），不再直接导出源码。
- **`example/cli-api-gen` 需要自备 swagger 文件**：`.gitignore` 忽略了 `src/swagger/**` 和 `src/apis/**`，克隆后直接跑 `dune` 会因缺文件失败，属预期行为。
