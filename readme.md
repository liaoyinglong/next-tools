## dune

### 外部可能用的模块

| 模块                                            | 简介                |
| ----------------------------------------------- | ------------------- |
| [cli](./packages/cli/readme.md)                 | `cli`集合           |
| [next-plugin](./packages/next-plugin/readme.md) | `next.js`的插件预设 |
| [tools](./packages/tools/readme.md)             | 运行时的工具库      |

### 对内的模块

| 模块                                          | 简介                                          |
| --------------------------------------------- | --------------------------------------------- |
| [swc_plugin](./packages/swc_plugin/readme.md) | `swc`插件 (无需引用，集成在`next-plugin`)     |
| [unplugin](./packages/unplugin/readme.md)     | `unplugin`插件(无需引用，集成在`next-plugin`) |
| [wasm](./packages/wasm/readme.md)             | 包装的`wasm`导出(目前提供给`cli`用)           |
