# @dune2/vite

面向 Vite 的编译期插件，用于处理 `createIsomorphicFn()` 同构函数链：构建时按 `consumer` 保留目标分支（默认 `server`），缺失分支统一替换为 `() => {}`。

## 功能特性

- 基于 [ast-grep](https://ast-grep.github.io/) 做 AST 级改写
- 仅在源码包含 `createIsomorphicFn` / `createServerOnlyFn` / `createClientOnlyFn` 时参与转换
- 默认匹配 `.ts` / `.tsx` / `.js` / `.jsx` / `.mjs` / `.cjs`，可通过 `include` 自定义
- 跳过 Vite 虚拟模块（路径含 `\0`）
- 支持静态配置与按环境动态配置（`Dune2ViteOptionsFactory`）
- 导出 `createIsomorphicFnTransform` / `createServerOnlyFnTransform` / `createClientOnlyFnTransform`，便于在测试或自定义工具链中复用

## 安装

```bash
pnpm add -D @dune2/vite
pnpm add vite   # peer dependency，需由项目自行安装
```

支持的 Vite 版本：`^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0`（见 `package.json` 的 `peerDependencies`）。

## 快速开始

在 `vite.config.ts` 注册插件（`enforce: 'pre'`，会优先执行）：

```ts
import { defineConfig } from 'vite';
import { dune2Vite } from '@dune2/vite';

export default defineConfig({
  plugins: [dune2Vite()],
});
```

## 转换规则

`consumer` 控制保留分支，默认值为 `server`。

| 源码                                       | `consumer: 'server'` | `consumer: 'client'` |
| ------------------------------------------ | -------------------- | -------------------- |
| `createIsomorphicFn().server(s).client(c)` | `s`                  | `c`                  |
| `createIsomorphicFn().client(c).server(s)` | `s`                  | `c`                  |
| `createIsomorphicFn().server(s)`           | `s`                  | `() => {}`           |
| `createIsomorphicFn().client(c)`           | `() => {}`           | `c`                  |
| `createIsomorphicFn()`                     | `() => {}`           | `() => {}`           |
| `createServerOnlyFn(f)`                    | `f`                  | 抛错函数             |
| `createClientOnlyFn(f)`                    | 抛错函数             | `f`                  |

示例：

```ts
// 输入
export const log = createIsomorphicFn()
  .server((m) => console.log('server:', m))
  .client((m) => console.log('client:', m));

// consumer: 'server' 输出
export const log = (m) => console.log('server:', m);

// consumer: 'client' 输出
export const log = (m) => console.log('client:', m);
```

错误文案：

- `createServerOnlyFn` 在 client 侧替换为：`createServerOnlyFn() functions can only be called on the server!`
- `createClientOnlyFn` 在 server 侧替换为：`createClientOnlyFn() functions can only be called on the client!`

## 配置项

```ts
interface Dune2ViteOptions {
  /** 参与扫描的文件路径正则，默认 /\.[mc]?[jt]sx?$/ */
  include?: RegExp;
  /** 选择保留的分支，默认 'server' */
  consumer?: 'server' | 'client';
}

type Dune2ViteOptionsFactory = (
  environment: PartialEnvironment,
) => Dune2ViteOptions | false | null | undefined;
```

`Dune2ViteOptionsFactory` 基于 `plugin.applyToEnvironment` 分发插件实例，适合同一份配置覆盖多种构建环境。

## 使用示例

```ts
import { dune2Vite } from '@dune2/vite';

// 1) 默认保留 server 分支
dune2Vite();

// 2) 显式保留 client 分支
dune2Vite({ consumer: 'client' });

// 3) 按环境动态选择分支
dune2Vite((environment) => {
  if (environment.config.consumer === 'server') {
    return { consumer: 'server' };
  }
  if (environment.config.consumer === 'client') {
    return { consumer: 'client' };
  }
  return false;
});
```

返回 `false | null | undefined` 会在当前环境停用插件。

## 高级用法

插件额外导出 `createIsomorphicFnTransform`、`createServerOnlyFnTransform`、`createClientOnlyFnTransform`，可在自定义 AST 流水线中复用同一套改写规则（需自行 `parse` / `commitEdits`，用法见 `src/transforms/*.ts`）。

## 开发

在 monorepo 根目录或本包目录执行：

```bash
cd packages/vite
pnpm run build   # 类型检查 + tsdown 打包
pnpm run test
```
