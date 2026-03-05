import { defineConfig, type UserConfig } from 'tsdown';

const common: UserConfig = {
  name: 'dune',
  target: 'node16',
  sourcemap: true,
  tsconfig: './tsconfig.json',
  format: ['esm'],
  dts: true,
  inlineOnly: false,
  checks: {
    pluginTimings: false,
  },
};

export default defineConfig([
  {
    ...common,
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli.ts',
      normalizeConfig: 'src/shared/config/normalizeConfig.ts',
    },
  },
]);
