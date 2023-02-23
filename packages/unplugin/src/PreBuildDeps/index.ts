import { createUnplugin } from "unplugin";
import { preBuildDepsCore } from "./core";
import {
  normalizeOptions,
  preBuildDepsLog,
  PreBuildDepsPluginOptions,
} from "./shared";

export { PreBuildDepsPluginOptions } from "./shared";

let promiseMap = new Map<PreBuildDepsPluginOptions, Promise<void>>();

export const preBuildDepsPlugin = createUnplugin(
  (options: PreBuildDepsPluginOptions) => {
    const name = "dune:preBuildDepsPlugin";
    const normalizedOptions = normalizeOptions(options);

    let promise = promiseMap.get(options);

    if (!promise) {
      promise = (async () => {
        try {
          preBuildDepsLog(`开始预先构建依赖`);
          await preBuildDepsCore(normalizedOptions);
        } catch (e) {
          preBuildDepsLog(`预先构建依赖失败: ${e.message}，将跳过预先构建依赖`);
        }
      })();
      promiseMap.set(options, promise);
    }

    return {
      name,
      webpack(compiler) {
        const work = () => {
          return promise;
        };
        // https://github.com/webpack/webpack/issues/10061
        compiler.hooks.beforeRun.tapPromise(name, work);
        compiler.hooks.watchRun.tapPromise(name, work);
        // compiler.options.resolve.alias
      },
    };
  }
);
