---
'@dune2/tools': minor
---

补充包元数据：声明 `react` peerDependencies（`^18 || ^19`）与 `sideEffects: false`，完善 description/keywords。运行时代码无变化。

内部调整：`RequestBuilder` 的普通入口与 react-server 入口改为共享 `RequestBuilderBase`（请求构造、url 参数替换、queryKey 生成只有一份实现），对外 API 与运行时行为不变。
