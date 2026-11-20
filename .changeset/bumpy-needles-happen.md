---
'@dune2/tools': major
---

`RequestBuilder` 新增 `toRequest` 参数映射并移除 `urlPathParams`：

- 自动从 `url` 模板中的 `{x}` 提取 path 参数并使用 `encodeURIComponent` 编码；缺失、值为 `null`/`undefined` 或出现模板外字段时抛错。
- 省略 `toRequest` 时按默认规则分发（`get`/`head`/`options` 放 `query`，其他 method 放 `body`，剩余为空时不设置）。
- `GET`/`HEAD` 携带 `body` 时抛错；`requestWithConfig` 保留为底层逃生口并从 `config.path` 替换 path 参数。
