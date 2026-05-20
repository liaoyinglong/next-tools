import { type Edit, type SgNode, parse } from '@ast-grep/napi';
import { detectLang } from './shared';

/**
 * Replaces `createServerOnlyFn(fn)` with `fn`. Matches by identifier name
 * only (no scope analysis); shadowed locals will be rewritten too.
 */
export function createServerOnlyFnTransform(
  root: SgNode,
  edits: Edit[],
  filename: string,
): void {
  const calls = root.findAll('createServerOnlyFn($$$ARGS)');
  for (const node of calls) {
    const args = node.getMultipleMatches('ARGS');
    if (args.length !== 1) {
      const { start } = node.range();
      throw new Error(
        '[@dune2/vite] createServerOnlyFn() must be called with a single function argument. ' +
          `(at ${filename}:${start.line + 1}:${start.column + 1})`,
      );
    }
    const inner = args[0]!;
    edits.push(node.replace(inner.text()));
  }
}

export function compileCreateServerOnlyFn(
  code: string,
  filename: string,
): string {
  const root = parse(detectLang(filename), code).root();
  const edits: Edit[] = [];
  createServerOnlyFnTransform(root, edits, filename);
  return root.commitEdits(edits);
}

export default createServerOnlyFnTransform;
