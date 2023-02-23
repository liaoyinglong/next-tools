import { isDeepStrictEqual } from "util";
import { PreBuildDepsPluginOptions, preBuildDepsLog } from "./shared";
import path from "path";
import fs from "fs-extra";
import esbuild from "esbuild";

interface ConfigJson {
  alias: Record<string, string>;
  deps: Record<string, string>;
}

/**
 * 开始预先构建依赖
 * 需要指定 依赖的名称 和 路径
 */
export async function preBuildDepsCore(
  options: PreBuildDepsPluginOptions
): Promise<ConfigJson["alias"]> {
  //#region 缓存的配置相关
  const preBuildCacheJsonPath = path.resolve(options.cacheDir, "cache.json");
  let preBuild: ConfigJson = await fs
    .readJSON(preBuildCacheJsonPath)
    .catch(() => ({}));
  preBuild.alias = preBuild.alias || {};
  preBuild.deps = preBuild.deps || {};
  //#endregion

  if (isDeepStrictEqual(preBuild.deps, options.deps)) {
    preBuildDepsLog(`[core] 跳过构建，因为依赖没有变化`);
    return preBuild.alias;
  }
  // 依赖发生变化，重新构建
  preBuild.deps = options.deps;

  const outdir = path.resolve(options.cacheDir, "deps");
  try {
    await esbuild.build({
      entryPoints: options.deps,
      format: "esm",
      bundle: true,
      outdir,
      allowOverwrite: true,
    });
  } catch (e) {
    preBuildDepsLog(`[core] 构建失败: ${e.message}`);
  }
  Object.entries(options.deps).forEach(([depImportName, depPath]) => {
    // 保存到 json 中，后续要用这个路径覆盖 webpack 的 alias
    preBuild.alias[depImportName] = path.join(outdir, `${depImportName}.js`);
  });
  await fs.writeJSON(preBuildCacheJsonPath, preBuild, {
    spaces: 2,
  });
  preBuildDepsLog(`[core] 构建成功`);
  return preBuild.alias;

  // const cache = fileEntryCache.createFromFile(
  //   path.resolve(options.cacheDir, "fileCache.json")
  // );
  // cache.reconcile();
  //

  // if (!cache.hasFileChanged(options.lockFilePath)) {
  //   return;
  // }
}
