import { type Edit, type SgNode, parse } from '@ast-grep/napi';
import { detectLang } from './shared';

/**
 * Server-target transform for `createIsomorphicFn().server(s).client(c)`.
 *
 * Replaces the chain with its `.server(...)` argument, or `() => {}` if
 * no server implementation was provided. Longer patterns are tried
 * first; any match nested inside an already-replaced range is skipped.
 */
const rules: { pattern: string; replace: (m: SgNode) => string }[] = [
  {
    pattern: 'createIsomorphicFn().server($S).client($C)',
    replace: (m) => m.getMatch('S')!.text(),
  },
  {
    pattern: 'createIsomorphicFn().client($C).server($S)',
    replace: (m) => m.getMatch('S')!.text(),
  },
  {
    pattern: 'createIsomorphicFn().server($S)',
    replace: (m) => m.getMatch('S')!.text(),
  },
  {
    pattern: 'createIsomorphicFn().client($C)',
    replace: () => '() => {}',
  },
  {
    pattern: 'createIsomorphicFn()',
    replace: () => '() => {}',
  },
];

export function createIsomorphicFnTransform(
  root: SgNode,
  edits: Edit[],
  _filename: string,
): void {
  const claimed: Array<[number, number]> = [];
  for (const { pattern, replace } of rules) {
    for (const node of root.findAll(pattern)) {
      const { start, end } = node.range();
      if (claimed.some(([s, e]) => start.index < e && end.index > s)) continue;
      claimed.push([start.index, end.index]);
      edits.push(node.replace(replace(node)));
    }
  }
}

export function compileCreateIsomorphicFn(
  code: string,
  filename: string,
): string {
  const root = parse(detectLang(filename), code).root();
  const edits: Edit[] = [];
  createIsomorphicFnTransform(root, edits, filename);
  return root.commitEdits(edits);
}
