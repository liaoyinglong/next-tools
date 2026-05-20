import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    name: 'vite',
    target: 'node18',
    sourcemap: true,
    tsconfig: './tsconfig.json',
    dts: true,
    format: ['esm', 'cjs'],
    entry: {
      index: 'src/index.ts',
    },
  },
]);
