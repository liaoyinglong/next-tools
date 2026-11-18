# @dune2/cli

## 2.1.1

### Patch Changes

- dc55e5b: fix(cli): 自动抽离单文件内重复的 Zod 子表达式，并兼容处理 OpenAPI `pattern` 中的内联正则标志

## 2.1.0

### Minor Changes

- df826bb: feat(cli): 新增 `enableZod` 与 `compatibleNumberString` 配置项，支持按需生成可 tree-shaking 的 Zod v4 请求校验 schema 及 `number | string` 兼容类型

## 2.0.3

### Patch Changes

- c72fd17: 修复响应使用 `oneOf` / `anyOf` 时未解包各分支 `data` 字段的问题。先解析响应包装层的 `$ref`，再分别调用响应转换器，生成实际数据类型的联合。没有 `data` 的分支保留原结构，提取后的数据内部不再重复解包。支持自定义响应转换器，并补充回归测试和配置说明。

## 2.0.2

### Patch Changes

- 8426a31: 补充根目录 MIT LICENSE 文件，并把各包 `package.json` 的 `license` 字段统一为 `MIT`（`@dune2/tools` 此前为 ISC，其余包缺失该字段）。同时补充 `@dune2/babel` 的 readme，此前该包在 npm 上没有说明文档。仅元数据变更，不影响运行时行为。
- f5770cb: 仓库工程化整理：包级 `lint` 脚本改名为 `typecheck`（原本就是 `tsc` 类型检查），并新增根目录 `typecheck` 汇总命令；`@dune2/tools` 的类型级测试脚本单独命名为 `test:types`。仅脚本命名变更，不影响发布产物。

## 2.0.1

### Patch Changes

- b19679d: Fix request body type generation when an operation has only header or cookie parameters, or an empty parameters list. Preserve array and scalar body types instead of replacing them with an empty object type.

## 2.0.0

### Major Changes

- acbe3cc: 清理未文档化的内部导出与遗留配置，收紧错误处理：

  - 移除主入口的 `letters`、`defaultJsonSorter` re-export（i18n 功能残留，无内部使用）
  - 移除 `Config.cacheDir` 字段（从未被使用）
  - `getConfig` 在配置文件存在但加载失败（如语法错误）时直接抛出，而不是被吞掉后返回空配置；`normalizeConfig` 不再原地修改传入对象
  - 顶层 CLI 异常现在会打印错误并以退出码 1 结束
  - `generateApi` 将接口代码生成并发限制为 10，兼容 requestBody 仅含 `multipart/form-data` 等 content 的接口
  - 远程 swagger 文档的自行 fetch 现在遵循 `dereferenceSwaggerConfig.resolve.http.timeout`（默认 30s）超时
  - `generateApi` 命令按职责拆分为 parseSwagger / requestCode / typeCompiler / formatter 等模块，`generateApiRequestCode` 与 `asyncLocalStorage` 的导出保持不变
  - 修复 Windows 下 `output` 配成绝对路径时生成文件落到错误的 `C_\...` 目录（之前对整条路径做 `:` 替换，把盘符也替换掉了）

### Patch Changes

- acbe3cc: 升级构建与运行时依赖：changesets 3、oxfmt 0.67、vitest 5、tsdown 0.23（`inlineOnly` 迁移为 `deps.onlyBundle`）、swagger-parser 13、@ast-grep/napi 0.45、magic-string 1、publint 0.3.24、@types/js-cookie 3.0.6。@dune2/cli 同时从 Babel 系类型生成器切换到 @fumari/json-schema-ts 的输出（数组 Items 描述会出现在文档注释中）。

## 1.2.8

### Patch Changes

- da1f9db: Handle malformed scalar enums on array schemas when generating API request types.
- 5f5cf9c: Remove the obsolete i18n entry from the public `dune init` configuration template and publish the es-toolkit production dependency range as ^1.50.0.

## 1.2.7

### Patch Changes

- 0d2180f: Replace `json-schema-to-typescript` with `@fumari/json-schema-ts` for API type generation.
- b98ce4a: Flatten object schemas referenced by query parameters when generating request types.

## 1.2.6

### Patch Changes

- e3be89a: Fix package export metadata, align React-related peers, and harden API generation for JSON-compatible 200 responses.

## 1.2.5

### Patch Changes

- a1bd65b: perf(generateApi): 大幅提升 API 生成速度

  - 编译类型时只挂载可达的 `$ref` 定义，替代原来把整份 `components`/`definitions` 挂到每个 schema 上的做法，避免 `json-schema-to-typescript` 每次都全量遍历类型图
  - 关闭 `compile` 内置的 prettier 格式化（生成后统一由 `codeFormatterCmd` 格式化）

  在 261 个接口的 swagger 上，端到端耗时从 ~18.6s 降至 ~0.5s，类型输出结构保持不变。

## 1.2.4

### Patch Changes

- 58d02c6: fix type generation by stripping schema `default` values before compile to avoid invalid intersections like `number & string`.

## 1.2.3

### Patch Changes

- 9be188f: 修复同时包含请求体和路径参数的接口生成结果，确保路径参数不会丢失。

## 1.2.2

### Patch Changes

- 0bba693: fix: swagger-parser fails to resolve remote HTTP URLs, pre-fetch JSON before bundling

## 1.2.1

### Patch Changes

- da5c9e1: Fix Swagger v2 support in `generateApi` by handling `#/definitions/*` refs during type generation and supporting `response.schema` responses.

## 1.2.0

### Minor Changes

- 9914d16: upgrade deps
