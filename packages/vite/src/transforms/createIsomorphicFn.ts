import type babel from '@babel/core';
import type { PluginObj } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import t from '@babel/types';
import { isImportedBinding } from './shared';

/**
 * Server-target transform for `createIsomorphicFn().server(s).client(c)`.
 *
 * Walks up from the innermost `createIsomorphicFn()` call through any
 * chained `.server(fn)` / `.client(fn)` method calls. Replaces the
 * outermost chain expression with the argument passed to `.server(...)`,
 * or `() => {}` if no `.server` arm was provided. Matches TanStack
 * Start's `handleCreateIsomorphicFn.ts` behavior on the server env.
 */
export const createIsomorphicFnPlugin = (_api: typeof babel): PluginObj => {
  return {
    name: 'dune2-create-isomorphic-fn',
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          callee.type !== 'Identifier' ||
          callee.name !== 'createIsomorphicFn'
        ) {
          return;
        }
        if (!isImportedBinding(path, 'createIsomorphicFn')) {
          return;
        }

        let outer: NodePath = path;
        let serverArg: t.Expression | null = null;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const member = outer.parentPath;
          if (
            !member ||
            !member.isMemberExpression() ||
            member.node.object !== outer.node ||
            member.node.computed
          ) {
            break;
          }
          const prop = member.node.property;
          if (!t.isIdentifier(prop)) {
            break;
          }
          const call = member.parentPath;
          if (
            !call ||
            !call.isCallExpression() ||
            call.node.callee !== member.node
          ) {
            break;
          }
          if (prop.name === 'server') {
            const first = call.node.arguments[0];
            if (first && t.isExpression(first)) {
              serverArg = first;
            }
          }
          outer = call;
        }

        const replacement =
          serverArg ?? t.arrowFunctionExpression([], t.blockStatement([]));
        outer.replaceWith(replacement);
      },
    },
  };
};

export default createIsomorphicFnPlugin;
