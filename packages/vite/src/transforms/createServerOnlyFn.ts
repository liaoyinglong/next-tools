import type babel from '@babel/core';
import type { PluginObj } from '@babel/core';
import t from '@babel/types';
import { isImportedBinding } from './shared';

/**
 * Server-target transform for `createServerOnlyFn(fn)` — replaces the call
 * with its single function argument. Matches TanStack Start's
 * `handleEnvOnly.ts` behavior on the server env.
 */
export const createServerOnlyFnPlugin = (_api: typeof babel): PluginObj => {
  return {
    name: 'dune2-create-server-only-fn',
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          callee.type !== 'Identifier' ||
          callee.name !== 'createServerOnlyFn'
        ) {
          return;
        }
        if (!isImportedBinding(path, 'createServerOnlyFn')) {
          return;
        }

        const args = path.node.arguments;
        const inner = args[0];
        if (args.length !== 1 || !inner || !t.isExpression(inner)) {
          throw path.buildCodeFrameError(
            '[@dune2/vite] createServerOnlyFn() must be called with a single function argument.',
          );
        }
        path.replaceWith(inner);
      },
    },
  };
};

export default createServerOnlyFnPlugin;
