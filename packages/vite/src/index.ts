import { transformAsync, type PluginItem } from '@babel/core';
import type { Plugin } from 'vite';
import { createIsomorphicFnPlugin } from './transforms/createIsomorphicFn';
import { createServerFnPlugin } from './transforms/createServerFn';
import { createServerOnlyFnPlugin } from './transforms/createServerOnlyFn';
import { cleanupTriggerImportsPlugin } from './transforms/shared';

export interface Dune2ViteOptions {
  /** Files to scan. Default: /\.[mc]?[jt]sx?$/ */
  include?: RegExp;
}

const DEFAULT_INCLUDE = /\.[mc]?[jt]sx?$/;
const TRIGGER = /\b(createServerFn|createServerOnlyFn|createIsomorphicFn)\b/;

export default function dune2(options: Dune2ViteOptions = {}): Plugin {
  const include = options.include ?? DEFAULT_INCLUDE;
  return {
    name: '@dune2/vite',
    enforce: 'pre',
    async transform(code, id) {
      if (id.includes('\0') || !include.test(id)) return null;
      if (!TRIGGER.test(code)) return null;

      const result = await transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        sourceType: 'module',
        sourceMaps: true,
        plugins: [
          [
            '@babel/plugin-syntax-typescript',
            { isTSX: true, allExtensions: true },
          ],
          '@babel/plugin-syntax-jsx',
          createServerFnPlugin,
          createServerOnlyFnPlugin,
          createIsomorphicFnPlugin,
          cleanupTriggerImportsPlugin,
        ] as PluginItem[],
      });

      if (!result?.code) return null;
      return { code: result.code, map: result.map ?? null };
    },
  };
}

export { createIsomorphicFnPlugin } from './transforms/createIsomorphicFn';
export { createServerFnPlugin } from './transforms/createServerFn';
export { createServerOnlyFnPlugin } from './transforms/createServerOnlyFn';
