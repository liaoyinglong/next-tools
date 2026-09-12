---
'@dune2/cli': major
---

清理未文档化的内部导出与遗留配置，收紧错误处理：

- 移除主入口的 `letters`、`defaultJsonSorter` re-export（i18n 功能残留，无内部使用）
- 移除 `Config.cacheDir` 字段（从未被使用）
- `getConfig` 在配置文件存在但加载失败（如语法错误）时直接抛出，而不是被吞掉后返回空配置；`normalizeConfig` 不再原地修改传入对象
- 顶层 CLI 异常现在会打印错误并以退出码 1 结束
- `generateApi` 限制并发为 10，兼容 requestBody 仅含 `multipart/form-data` 等 content 的接口
- 远程 swagger 文档的自行 fetch 现在遵循 `dereferenceSwaggerConfig.resolve.http.timeout`（默认 30s）超时
- `generateApi` 命令按职责拆分为 parseSwagger / requestCode / typeCompiler / formatter 等模块，`generateApiRequestCode` 与 `asyncLocalStorage` 的导出保持不变
- 修复 Windows 下 `output` 配成绝对路径时生成文件落到错误的 `C_\...` 目录（之前对整条路径做 `:` 替换，把盘符也替换掉了）
