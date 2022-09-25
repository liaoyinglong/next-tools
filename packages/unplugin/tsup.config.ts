import { defineConfig } from "tsup";

export default defineConfig({
  name: "webpack",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  entry: [],
  dts: {
    // resolve: true,
    // build types for `src/index.ts` only
    // otherwise `Options` will not be exported by `tsup`, not sure how this happens, probably a bug in rollup-plugin-dts
    entry: "./src/index.ts",
  },
});
