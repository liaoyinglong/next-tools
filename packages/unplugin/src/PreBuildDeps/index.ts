import { createUnplugin } from "unplugin";
import { preBuildDepsCore } from "./core";
import {
  normalizeOptions,
  preBuildDepsLog,
  PreBuildDepsPluginOptions,
} from "./shared";

export { PreBuildDepsPluginOptions } from "./shared";

let promiseMap = new Map<
  PreBuildDepsPluginOptions,
  ReturnType<typeof preBuildDepsCore>
>();

export const preBuildDepsPlugin = createUnplugin(
  (options: PreBuildDepsPluginOptions) => {
    const name = "dune:preBuildDepsPlugin";
    const normalizedOptions = normalizeOptions(options);

    let promise = promiseMap.get(options);

    if (!promise) {
      promise = (async () => {
        try {
          preBuildDepsLog(`[plugin] 开始预先构建依赖`);
          return await preBuildDepsCore(normalizedOptions);
        } catch (e) {
          preBuildDepsLog(
            `[plugin] 预先构建依赖失败: ${e.message}，将跳过预先构建依赖`
          );
        }
      })();
      promiseMap.set(options, promise);
    }

    return {
      name,
      webpack(compiler) {
        let done = false;
        const work = async () => {
          if (done) {
            return;
          }
          done = true;
          const res = await promise;
          const alias = Object.fromEntries(
            Object.entries(res).map(([key, value]) => [`${key}$`, value])
          );
          compiler.options.resolve.alias = {
            ...compiler.options.resolve.alias,
            ...alias,
          };
          preBuildDepsLog("[plugin] 已覆盖 webpack 的 alias 配置");
        };
        // https://github.com/webpack/webpack/issues/10061
        compiler.hooks.beforeRun.tapPromise(name, work);
        compiler.hooks.watchRun.tapPromise(name, work);
      },
    };
  }
);
