import { NextConfig } from "next";
import { WebpackConfigContext } from "next/dist/server/config-shared";
import { Options as AutoImportOptions } from "unplugin-auto-import/types";
import {
  autoImportPlugin,
  defaultAutoImports,
  defaultTranspileModules,
} from "./shared";

import { BeforeSwcLoaderOptions } from "./beforeSwcLoader";

export * from "./shared";

export interface DunePresetsOptions {
  autoImport?: AutoImportOptions;

  /**
   * 在运行 swc loader 之前做的处理
   * - 目前用来自动加上 use client
   *   - 如检测到了 emotion 的 css-in-js 的代码，就会自动加上 use client
   * - 以及给 /@atlaskit/ 下的文件加上 jsxRuntime classic 以兼容 next 13
   */
  beforeSwcLoader?: BeforeSwcLoaderOptions;
}

/**
 * 这里 next.js 相关预设
 * 整合部分编译时的插件
 */
export const withDunePresets = (options: DunePresetsOptions = {}) => {
  return withDunePresetsImpl;
  function withDunePresetsImpl(nextConfig: NextConfig) {
    updateValue(nextConfig, ["experimental", "externalDir"], true);
    updateValue(nextConfig, ["transpilePackages"], defaultTranspileModules);

    const combinedConfig = {
      ...nextConfig,
      webpack: (config, webpackFnOptions: WebpackConfigContext) => {
        config.plugins.unshift(
          autoImportPlugin({
            ...options.autoImport,
            imports: defaultAutoImports
              .concat(options.autoImport?.imports as never)
              .filter(Boolean) as never,
          }),
        );

        if (options.beforeSwcLoader) {
          const beforeSwcLoader = require.resolve("./beforeSwcLoader");
          const work = (rules: any[]) => {
            rules.forEach((rule) => {
              if (Array.isArray(rule.oneOf)) {
                work(rule.oneOf);
                return;
              }
              const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
              let hasSwcLoader = false;
              let hasBeforeSwcLoader = false;

              uses.forEach((v) => {
                const l = typeof v === "object" ? v.loader : v;
                hasSwcLoader = hasSwcLoader || l === "next-swc-loader";
                hasBeforeSwcLoader =
                  hasBeforeSwcLoader || l === beforeSwcLoader;
              });
              if (hasSwcLoader && !hasBeforeSwcLoader) {
                uses.push({
                  loader: beforeSwcLoader,
                  options: options.beforeSwcLoader,
                });
                rule.use = uses;
              }
            });
          };
          work(config.module.rules);
        }

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
 * 如果是 undefined，会设置为默认值
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
