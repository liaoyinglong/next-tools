import { Options as AutoImportOptions } from "unplugin-auto-import/types";
import { i18nResourcePlugin } from "@dune2/unplugin";
import { NextConfig } from "next";
import {
  autoImportPlugin,
  defaultAutoImports,
  defaultSwcPlugins,
  defaultTranspileModules,
} from "./shared";

export * from "./shared";

export interface DunePresetsOptions {
  autoImport?: AutoImportOptions;
}

/**
 * 这里 next.js 相关预设
 * 整合部分编译时的插件
 */
export const withDunePresets = (options: DunePresetsOptions = {}) => {
  return withDunePresetsImpl;
  function withDunePresetsImpl(nextConfig: NextConfig) {
    updateValue(nextConfig, ["experimental", "externalDir"], true);
    updateValue(nextConfig, ["experimental", "swcPlugins"], defaultSwcPlugins);
    updateValue(
      nextConfig,
      ["experimental", "transpilePackages"],
      defaultTranspileModules
    );

    const combinedConfig = {
      ...nextConfig,
      webpack: (config, webpackFnOptions) => {
        config.plugins.unshift(
          autoImportPlugin({
            ...options.autoImport,
            imports: defaultAutoImports
              .concat(options.autoImport?.imports as never)
              .filter(Boolean) as never,
          }),
          i18nResourcePlugin.webpack()
        );

        // Overload the Webpack config if it was already overloaded
        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, webpackFnOptions);
        }
        return config;
      },
    };

    return combinedConfig;
  }
};

/**
 * 更新对象的值
 * 值的类型是数组，会合并
 * 值的类型是对象，会合并
 * 如果是undefined，会设置为默认值
 */
function updateValue(obj: any, path: string[], value: any) {
  const last = path.pop();
  path.forEach((key) => {
    obj = obj[key] || (obj[key] = {});
  });

  if (Array.isArray(obj[last])) {
    obj[last] = [...obj[last], ...value];
    return;
  }
  if (typeof obj[last] === "object") {
    obj[last] = { ...obj[last], ...value };
    return;
  }
  if (typeof obj[last] === "undefined") {
    obj[last] = value;
  }
}
