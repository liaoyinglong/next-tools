import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'babel',
    target: 'node',
    sourcemap: true,
    tsconfig: './tsconfig.json',
    dts: true,
    format: ['esm', 'cjs'],
    entry: {
      index: 'src/index.ts',
      createStore: 'src/createStore/index.ts',
    },
  },
]);
