import fs from "fs-extra";
import path from "path";
import debug from "debug";
export interface PreBuildDepsPluginOptions {
  /**
   * key:   依赖的名称(import xx from 'source' 中的 source，届时会在 webpack 的 alias 中重写对应的路径 )
   * value: 依赖的入口文件路径
   * @tips 只支持 esm 模块
   */
  deps: Record<string, string>;

  /**
   * 输出文件的缓存目录
   * 默认为 node_modules/.cache/dune-pre-build-cache
   */
  cacheDir?: string;
  /**
   * 标识
   * lockfile 变了，就会重新构建依赖
   * 默认为 pnpm-lock.yaml 或 yarn.lock 或 package-lock.json
   */
  lockFilePath?: string;

  // 默认为 process.cwd()
  cwd?: string;
}

export function normalizeOptions(
  options: PreBuildDepsPluginOptions
): PreBuildDepsPluginOptions {
  const cwd = options.cwd || process.cwd();
  const cacheDir =
    options.cacheDir ||
    path.resolve(cwd, "node_modules/.cache/dune-pre-build-cache");

  const lockFilePath =
    options.lockFilePath ||
    path.resolve(cwd, "pnpm-lock.yaml") ||
    path.resolve(cwd, "yarn.lock") ||
    path.resolve(cwd, "package-lock.json");

  fs.ensureDirSync(cacheDir);

  return {
    cacheDir,
    lockFilePath,
    ...options,
  };
}

export const preBuildDepsLog = console.log.bind(
  console,
  "[dune:preBuildDepsPlugin]: "
);
