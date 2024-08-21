import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    target: "node16",
  },
  test: {
    onConsoleLog(...args) {
      //console.log(...args);
      return true;
    },
  },
});
