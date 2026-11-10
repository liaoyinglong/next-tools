---
'@dune2/tools': patch
---

`defineReducer` 绑定后的 action 在类型上只保留 draft 之后的第一个参数，与运行时只转发一个 payload 的行为一致；多余的可选参数或 rest 参数在调用处会报类型错误，避免静默丢参。
