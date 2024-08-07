import { Options, defineConfig } from "tsup";

const common: Options = {
  name: "dune",
  target: "node16",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  dts: true,
};

export default defineConfig([
  {
    ...common,
    format: ["esm", "cjs"],
    entry: {
      index: "src/index.ts",
    },
  },
]);
