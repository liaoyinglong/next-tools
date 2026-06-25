import { type Edit, parse } from '@ast-grep/napi';
import type { Plugin } from 'vite';
import {
  createIsomorphicFnTransform,
  type Dune2Consumer,
} from './transforms/createIsomorphicFn';
import { TRIGGER, detectLang } from './transforms/shared';

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
      handler(code, id) {
        const root = parse(detectLang(id), code).root();
        const edits: Edit[] = [];
        createIsomorphicFnTransform(root, edits, id, consumer);

        if (edits.length === 0) return null;
        return { code: root.commitEdits(edits), map: null };
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
