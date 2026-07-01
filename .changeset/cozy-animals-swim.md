---
'@dune2/cli': patch
---

perf(generateApi): 大幅提升 API 生成速度

- 编译类型时只挂载可达的 `$ref` 定义，替代原来把整份 `components`/`definitions` 挂到每个 schema 上的做法，避免 `json-schema-to-typescript` 每次都全量遍历类型图
- 关闭 `compile` 内置的 prettier 格式化（生成后统一由 `codeFormatterCmd` 格式化）

在 261 个接口的 swagger 上，端到端耗时从 ~18.6s 降至 ~0.5s，类型输出结构保持不变。
