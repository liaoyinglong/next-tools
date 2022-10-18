import withTM from "next-transpile-modules";
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
  /**
   * 配置需要走babel/swc编译的依赖
   * 默认编译 @dune2 下面的依赖，也就是 内部包 发布到npm的时候可以ts
   * @see https://github.com/martpie/next-transpile-modules
   */
  transpileModules?: string[];
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

    const combinedConfig = withTM(
      defaultTranspileModules.concat(options.transpileModules).filter(Boolean)
    )({
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
    });

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
