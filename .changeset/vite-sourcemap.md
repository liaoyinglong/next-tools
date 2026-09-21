---
'@dune2/vite': minor
---

- transform 现在返回 sourcemap（通过 MagicString 重放 ast-grep edits 生成，带自校验，失败时回退为 null）
- 改用 `parseAsync` 在线程池解析，避免大文件阻塞事件循环
- 修正 `.` 导出的 types 条件：CJS 消费者现在解析到 `dist/index.d.cts`
