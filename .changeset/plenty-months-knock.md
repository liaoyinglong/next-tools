---
'@dune2/tools': minor
---

新增 `@dune2/tools/reducer` 子路径，提供 `defineReducer`：基于 React `useReducer` + immer 的组件内局部 reducer，action 内可直接修改 draft，payload 类型自动推导，返回新 state 可整体替换。`immer` 为可选 peer 依赖，仅使用该子路径时需要安装。
