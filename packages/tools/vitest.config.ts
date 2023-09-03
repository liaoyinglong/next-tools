import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    typecheck: {
      checker: "tsc",
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
