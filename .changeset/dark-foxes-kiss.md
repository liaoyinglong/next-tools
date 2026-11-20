---
'@dune2/cli': major
---

API 代码生成切换至 `RequestBuilder` 的 `toRequest` 参数映射，移除 `urlPathParams` 输出（请先升级 `@dune2/tools` 再重新生成）：

- 符合默认规则的接口省略 `toRequest`；非默认位置、混合参数、非对象 body 与 path/query 共存、字段重名改名（`pathXxx`）等场景生成 `toRequest`。
- 支持 path-item 参数继承与 operation 覆盖、object query 拍平与 `deepObject` 保留、`multipart/form-data` 生成 `body: FormData`。
- 改名后仍冲突或 query 与 body 重名时报错并跳过该接口。
