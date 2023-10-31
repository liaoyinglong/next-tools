export { default as autoImportPlugin } from "unplugin-auto-import/webpack";

export const defaultTranspileModules = ["@dune2/tools"];

export const defaultSwcPluginPath = require.resolve("@dune2/swc-plugin");

/**
 * @deprecated 用 defaultSwcPluginPath 自己组装参数
 */
export const defaultSwcPlugins = [[defaultSwcPluginPath, {}]];

export const defaultAutoImports = [
  "react",
  {
    "@dune2/tools/i18n": ["useT", "Trans", "useLocale"],
    "@dune2/tools/numbro": ["numbro"],
  },
];
