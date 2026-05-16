---
'@dune2/tools': minor
---

新增 `createStorageHelper` 工厂函数，支持运行时动态 key 的存储场景；`createStorage` 的 `namespace` 参数改为可选，不传时直接使用原始 key；导出 `StorageHelper` 类以便外部类型引用。
