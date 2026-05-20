import { type SgNode, parse } from '@ast-grep/napi';
import { detectLang } from './shared';

/**
 * Detects any call to `createServerFn(...)` and throws a compile-time
 * error pointing at the offending call. No scope analysis — name match only.
 */
export function createServerFnTransform(
  root: SgNode,
  _edits: unknown[],
  filename: string,
): void {
  const matches = root.findAll('createServerFn($$$ARGS)');
  if (matches.length === 0) return;

  const first = matches[0]!;
  const { start } = first.range();
  throw new Error(
    '[@dune2/vite] createServerFn() is not supported. ' +
      'Use createServerOnlyFn for server-only logic, or define a Nitro route directly for HTTP RPC. ' +
      `(at ${filename}:${start.line + 1}:${start.column + 1})`,
  );
}

export function compileCreateServerFn(code: string, filename: string): string {
  const root = parse(detectLang(filename), code).root();
  createServerFnTransform(root, [], filename);
  return code;
}

export default createServerFnTransform;
