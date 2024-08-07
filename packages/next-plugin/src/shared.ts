export { default as autoImportPlugin } from "unplugin-auto-import/webpack";

export const defaultTranspileModules = ["@dune2/tools"];

export const defaultAutoImports = [
  "react",
  {
    "@dune2/tools/i18n": ["useT", "Trans", "useLocale"],
    "@dune2/tools/numbro": ["numbro"],
  },
];
