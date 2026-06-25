import { type Edit, parse } from '@ast-grep/napi';
import type { Plugin } from 'vite';
import { createClientOnlyFnTransform } from './transforms/createClientOnlyFn';
import {
  createIsomorphicFnTransform,
  type Dune2Consumer,
} from './transforms/createIsomorphicFn';
import { createServerOnlyFnTransform } from './transforms/createServerOnlyFn';
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
      handler(code, id) {
        const lang = detectLang(id);
        let transformed = code;

        const root = parse(lang, transformed).root();
        const edits: Edit[] = [];

        // These transforms target independent call expressions, so one AST
        // scan and one commit avoids reparsing after each transform.
        for (const transform of TRANSFORMS) {
          transform(root, edits, id, consumer);
        }

        if (edits.length === 0) return null;
        transformed = root.commitEdits(edits);

        return { code: transformed, map: null };
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
