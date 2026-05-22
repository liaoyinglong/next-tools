# @dune2/vite

面向 Vite 的编译期插件，用于处理 `createIsomorphicFn()` 同构函数链：在构建时保留 **server** 实现、去掉 **client** 分支，便于 SSR 或服务端打包。

## 功能特性

- 基于 [ast-grep](https://ast-grep.github.io/) 做 AST 级改写，不依赖 Babel
- 仅在源码包含 `createIsomorphicFn` 时参与转换，无匹配则跳过
- 默认匹配 `.ts` / `.tsx` / `.js` / `.jsx` / `.mjs` / `.cjs`，可通过 `include` 自定义
- 跳过 Vite 虚拟模块（路径含 `\0`）
- 导出 `createIsomorphicFnTransform`，便于在测试或其它工具链中复用

## 安装

```bash
pnpm add -D @dune2/vite
pnpm add vite   # peer dependency，需由项目自行安装
```

支持的 Vite 版本：`^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0`（见 `package.json` 的 `peerDependencies`）。

## 使用

在 `vite.config.ts` 中注册插件（`enforce: 'pre'`，会尽早运行）：

```typescript
import { defineConfig } from 'vite';
import { dune2Vite } from '@dune2/vite';

export default defineConfig({
  plugins: [dune2Vite()],
});
```

## 转换规则

下列写法在构建后都会变成 **server** 侧实现；若无 server 则替换为 `() => {}`。

| 源码                                       | 构建结果   |
| ------------------------------------------ | ---------- |
| `createIsomorphicFn().server(s).client(c)` | `s`        |
| `createIsomorphicFn().client(c).server(s)` | `s`        |
| `createIsomorphicFn().server(s)`           | `s`        |
| `createIsomorphicFn().client(c)`           | `() => {}` |
| `createIsomorphicFn()`                     | `() => {}` |

示例：

```javascript
// 输入
export const log = createIsomorphicFn()
  .server((m) => console.log('server:', m))
  .client((m) => console.log('client:', m));

// 输出
export const log = (m) => console.log('server:', m);
```

嵌套或重叠的匹配会按更长模式优先处理，避免重复替换。

## 配置项

```typescript
interface Dune2ViteOptions {
  /** 参与扫描的文件路径正则，默认 /\.[mc]?[jt]sx?$/ */
  include?: RegExp;
}
```

示例：只处理 `.ts` / `.tsx`：

```typescript
dune2Vite({ include: /\.tsx?$/ });
```

## 高级用法

插件还导出 `createIsomorphicFnTransform`，可在自定义 AST 流水线里复用与插件相同的改写规则（需自行 `parse` / `commitEdits`，用法见 `src/transforms/createIsomorphicFn.ts`）。

## 开发

在 monorepo 根目录或本包目录：

```bash
cd packages/vite
pnpm run build   # 类型检查 + tsdown 打包
pnpm run test
```
