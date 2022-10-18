export { default as autoImportPlugin } from "unplugin-auto-import/webpack";

export const defaultTranspileModules = ["@dune2/tools"];

export const defaultSwcPlugins = [[require.resolve("@dune2/swc-plugin"), {}]];

export const defaultAutoImports = [
  "react",
  { "@dune2/tools": ["useT", "Trans"] },
];
