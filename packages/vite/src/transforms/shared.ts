import type babel from '@babel/core';
import type { PluginObj } from '@babel/core';
import type { NodePath } from '@babel/traverse';

/**
 * Returns true iff `name` resolves to an imported (module) binding in the
 * given path's scope. We use this to avoid rewriting locally-defined
 * functions that happen to share a name with the TanStack helpers.
 */
export function isImportedBinding(path: NodePath, name: string): boolean {
  const binding = path.scope.getBinding(name);
  return binding?.kind === 'module';
}

const TRIGGER_NAMES = new Set([
  'createServerFn',
  'createServerOnlyFn',
  'createIsomorphicFn',
]);

/**
 * After the trigger calls are replaced, their imports become dead. Strip
 * specifiers whose binding has zero references, and drop the whole
 * ImportDeclaration when no specifiers remain. Limited to our trigger
 * names so we don't touch unrelated user imports.
 */
export const cleanupTriggerImportsPlugin = (_api: typeof babel): PluginObj => ({
  name: 'dune2-cleanup-trigger-imports',
  visitor: {
    Program: {
      exit(path) {
        path.scope.crawl();
        for (const child of path.get('body')) {
          if (!child.isImportDeclaration()) continue;
          for (const spec of child.get('specifiers')) {
            const local = spec.node.local.name;
            if (!TRIGGER_NAMES.has(local)) continue;
            const binding = path.scope.getBinding(local);
            if (binding && binding.references === 0) {
              spec.remove();
            }
          }
          if (child.node.specifiers.length === 0) {
            child.remove();
          }
        }
      },
    },
  },
});
