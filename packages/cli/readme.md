# CLI 工具

一个基于 CAC 的命令行工具，主要用于 API 代码生成和配置管理。

## 功能特性

- 从 Swagger/OpenAPI 规范生成 API 请求代码
- 自动生成 TypeScript 类型定义
- 支持配置文件初始化
- 交互式命令选择界面

## 安装与使用

```bash
npm install @dune2/cli
```

## 支持的命令

```shell
Commands:
  generateApi  生成 API 文件
  init         初始化配置文件
  interactive  交互式操作
```

### 主要命令详解

#### `dune generateApi`

从 Swagger/OpenAPI 规范生成 API 请求代码，包括：

- 自动生成 TypeScript 类型定义
- 支持 URL 路径参数处理
- 生成请求构造器
- 支持响应类型推断
- 自动格式化生成的代码

#### `dune init`

初始化项目配置文件，创建 `dune.config.ts` 配置文件模板：

```typescript
import { defineConfig } from "@dune2/cli";

export default defineConfig({
  i18n: [],
  api: [],
});
```

#### `dune interactive` 或 `dune i`

进入交互式命令选择界面，提供友好的命令选择体验。

## 交互式模式

运行 `dune` 或 `dune interactive` 进入交互式选择模式，使用上下键选择要执行的命令，回车键确认执行。

## 配置文件

工具会在项目根目录查找 `dune.config.ts` 配置文件，支持：

- API 配置：Swagger 文档路径、输出目录等
- 国际化配置：多语言支持相关配置
