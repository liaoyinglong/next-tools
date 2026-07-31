import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    typecheck: {
      checker: 'tsc',
    },
    onConsoleLog() {
      return true;
    },
  },
  oxc: {
    jsx: {
      runtime: 'automatic',
    },
  },
});
