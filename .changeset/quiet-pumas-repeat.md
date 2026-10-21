---
'@dune2/babel': patch
'@dune2/cli': patch
'@dune2/tools': patch
'@dune2/vite': patch
---

仓库工程化整理：包级 `lint` 脚本改名为 `typecheck`（原本就是 `tsc` 类型检查），并新增根目录 `typecheck` 汇总命令；`@dune2/tools` 的类型级测试脚本单独命名为 `test:types`。仅脚本命名变更，不影响发布产物。
