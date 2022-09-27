import withTM from "next-transpile-modules";
import { Options as AutoImportOptions } from "unplugin-auto-import/types";
import autoImportPlugin from "unplugin-auto-import/webpack";
import { i18nResourcePlugin } from "@dune2/unplugin";

interface Options {
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
export const withDunePresets = (options: Options = {}) => {
  return withDunePresetsImpl;
  function withDunePresetsImpl(nextConfig: any) {
    set(nextConfig, ["experimental", "externalDir"], true);
    set(
      nextConfig,
      ["experimental", "swcPlugins"],
      [[require.resolve("@dune2/swc-plugin"), {}]].concat(
        nextConfig?.experimental?.swcPlugins
      )
    );

    const combinedConfig = withTM(
      ["@dune2/i18n"].concat(options.transpileModules).filter(Boolean)
    )(nextConfig);

    return {
      ...combinedConfig,
      webpack: (config, webpackFnOptions) => {
        config.plugins.unshift(
          autoImportPlugin({
            imports: ["react", { "@dune2/i18n": ["t", "Trans"] }]
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
  }
};

function set(obj: any, path: string[], value: any) {
  const last = path.pop();
  path.forEach((key) => {
    obj = obj[key] || (obj[key] = {});
  });
  if (obj[last] === undefined) {
    obj[last] = value;
  }
}
