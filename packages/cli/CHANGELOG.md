# @dune2/cli

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
