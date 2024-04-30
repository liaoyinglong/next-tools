import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    typecheck: {
      checker: "tsc",
    },
    onConsoleLog() {
      return true;
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
