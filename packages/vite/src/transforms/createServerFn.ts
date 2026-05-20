import type babel from '@babel/core';
import type { PluginObj } from '@babel/core';
import { isImportedBinding } from './shared';

/**
 * Detects any call to `createServerFn(...)` and throws a compile-time
 * codeframe error. Aligning with TanStack Start's `createServerFn` would
 * require dual-emit + manifest aggregation that is out of scope for this
 * package — we surface a clear error pointing the user at alternatives.
 */
export const createServerFnPlugin = (_api: typeof babel): PluginObj => {
  return {
    name: 'dune2-create-server-fn',
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee;
        if (callee.type !== 'Identifier' || callee.name !== 'createServerFn') {
          return;
        }
        if (!isImportedBinding(path, 'createServerFn')) {
          return;
        }
        throw path.buildCodeFrameError(
          '[@dune2/vite] createServerFn() is not supported. ' +
            'Use createServerOnlyFn for server-only logic, or define a Nitro route directly for HTTP RPC.',
        );
      },
    },
  };
};

export default createServerFnPlugin;
