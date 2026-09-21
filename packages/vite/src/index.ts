import { parseAsync } from '@ast-grep/napi';
import type { Plugin } from 'vite';
import { createClientOnlyFnTransform } from './transforms/createClientOnlyFn';
import { createIsomorphicFnTransform } from './transforms/createIsomorphicFn';
import { createServerOnlyFnTransform } from './transforms/createServerOnlyFn';
import {
  buildSourcemapFromEdits,
  collectTransformEdits,
  TRIGGER,
  detectLang,
  type Dune2Consumer,
} from './transforms/shared';

type Dune2ViteEnvironment = Parameters<
  NonNullable<Plugin['applyToEnvironment']>
>[0];

export interface Dune2ViteOptions {
  /** Files to scan. Default: /\.[mc]?[jt]sx?$/ */
  include?: RegExp;
  /** Branch kept after compile. Default: 'server' */
  consumer?: Dune2Consumer;
}

export type Dune2ViteOptionsFactory = (
  environment: Dune2ViteEnvironment,
) => Dune2ViteOptions | false | null | undefined;

const DEFAULT_INCLUDE = /\.[mc]?[jt]sx?$/;
const TRANSFORMS = [
  createIsomorphicFnTransform,
  createServerOnlyFnTransform,
  createClientOnlyFnTransform,
];

function createPlugin(options: Dune2ViteOptions = {}): Plugin {
  const include = options.include ?? DEFAULT_INCLUDE;
  const consumer = options.consumer ?? 'server';
  return {
    name: '@dune2/vite',
    enforce: 'pre',
    transform: {
      filter: {
        id: { include, exclude: /^\0/ },
        code: TRIGGER,
      },
      async handler(code, id) {
        // parseAsync 在线程池解析，避免大文件阻塞事件循环
        const root = (await parseAsync(detectLang(id), code)).root();

        // These transforms target independent call expressions, so one AST
        // scan and one commit avoids reparsing after each transform.
        const edits = collectTransformEdits(root, TRANSFORMS, id, consumer);

        if (edits.length === 0) return null;
        const transformed = root.commitEdits(edits);

        try {
          return {
            code: transformed,
            map: buildSourcemapFromEdits(code, transformed, edits, id),
          };
        } catch {
          return { code: transformed, map: null };
        }
      },
    },
  };
}

export function dune2Vite(
  options: Dune2ViteOptions | Dune2ViteOptionsFactory = {},
): Plugin {
  if (typeof options !== 'function') {
    return createPlugin(options);
  }

  return {
    name: '@dune2/vite',
    applyToEnvironment(environment) {
      const resolved = options(environment);
      if (!resolved) return false;
      return createPlugin(resolved);
    },
  };
}

export { createIsomorphicFnTransform } from './transforms/createIsomorphicFn';
export { createServerOnlyFnTransform } from './transforms/createServerOnlyFn';
export { createClientOnlyFnTransform } from './transforms/createClientOnlyFn';
export { compileTransform, type Dune2Consumer } from './transforms/shared';
