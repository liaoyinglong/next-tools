import { defineConfig } from "tsup";

export default defineConfig({
  name: "unplugin",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  entry: ["./src/i18nResource/index.ts", "./src/PreBuildDeps/index.ts"],
  dts: {
    // resolve: true,
    // build types for `src/index.ts` only
    // otherwise `Options` will not be exported by `tsup`, not sure how this happens, probably a bug in rollup-plugin-dts
  },
});
