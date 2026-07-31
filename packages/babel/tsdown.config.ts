import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'babel',
    target: 'node24',
    sourcemap: true,
    tsconfig: './tsconfig.json',
    dts: true,
    format: 'esm',
    entry: {
      index: 'src/index.ts',
      createStore: 'src/createStore/index.ts',
    },
  },
]);
