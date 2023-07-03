import { Options, defineConfig } from "tsup";

const common: Options = {
  name: "dune",
  target: "node16",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  format: ["esm"],
  dts: true,
};

export default defineConfig([
  {
    ...common,
    entry: {
      index: "src/index.ts",
      cli: "src/cli.ts",
      normalizeConfig: "src/shared/config/normalizeConfig.ts",
    },
  },
  {
    ...common,
    format: ["esm", "cjs"],
    external: ["prettier"],
    entry: {
      prettier: "src/prettier.ts",
    },
  },
]);
