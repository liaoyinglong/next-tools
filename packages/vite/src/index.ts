import { type Edit, parse } from '@ast-grep/napi';
import type { Plugin } from 'vite';
import { createIsomorphicFnTransform } from './transforms/createIsomorphicFn';
import { TRIGGER, detectLang } from './transforms/shared';

export interface Dune2ViteOptions {
  /** Files to scan. Default: /\.[mc]?[jt]sx?$/ */
  include?: RegExp;
}

const DEFAULT_INCLUDE = /\.[mc]?[jt]sx?$/;

export default function dune2(options: Dune2ViteOptions = {}): Plugin {
  const include = options.include ?? DEFAULT_INCLUDE;
  return {
    name: '@dune2/vite',
    enforce: 'pre',
    async transform(code, id) {
      if (id.includes('\0') || !include.test(id)) return null;
      if (!TRIGGER.test(code)) return null;

      const root = parse(detectLang(id), code).root();
      const edits: Edit[] = [];
      createIsomorphicFnTransform(root, edits, id);

      if (edits.length === 0) return null;
      return { code: root.commitEdits(edits), map: null };
    },
  };
}

export { createIsomorphicFnTransform } from './transforms/createIsomorphicFn';
