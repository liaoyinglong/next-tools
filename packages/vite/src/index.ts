import { type Edit, parse } from '@ast-grep/napi';
import type { Plugin } from 'vite';
import { createIsomorphicFnTransform } from './transforms/createIsomorphicFn';
import { TRIGGER, detectLang } from './transforms/shared';

export interface Dune2ViteOptions {
  /** Files to scan. Default: /\.[mc]?[jt]sx?$/ */
  include?: RegExp;
}

const DEFAULT_INCLUDE = /\.[mc]?[jt]sx?$/;

export function dune2Vite(options: Dune2ViteOptions = {}): Plugin {
  const include = options.include ?? DEFAULT_INCLUDE;
  return {
    name: '@dune2/vite',
    enforce: 'pre',
    transform: {
      filter: {
        id: include,
        code: TRIGGER,
      },
      handler(code, id) {
        const root = parse(detectLang(id), code).root();
        const edits: Edit[] = [];
        createIsomorphicFnTransform(root, edits, id);

        if (edits.length === 0) return null;
        return { code: root.commitEdits(edits), map: null };
      },
    },
  };
}

export { createIsomorphicFnTransform } from './transforms/createIsomorphicFn';
