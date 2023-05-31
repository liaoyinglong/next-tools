import { defineConfig } from "tsup";

export default defineConfig({
  name: "dune",
  target: "node16",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  format: ["esm"],
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
    normalizeConfig: "src/shared/config/normalizeConfig.ts",
  },
  dts: true,
});
