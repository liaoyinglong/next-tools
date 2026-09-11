---
'@dune2/babel': minor
---

- 修复 `.` 导出指向不存在的 `dist/index.d.ts` / `dist/index.js`，现在指向真实产物并 re-export `createStorePlugin`
- 为 CJS 消费者补充 `dist/*.d.cts` 类型条件
- 抽取两个 snapshot handler 中重复的 selector 提升与改写逻辑到 `shared.ts`，行为不变
