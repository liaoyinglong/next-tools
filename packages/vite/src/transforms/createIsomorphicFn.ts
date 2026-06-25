import { type Edit, type SgNode, parse } from '@ast-grep/napi';
import { detectLang } from './shared';

export type Dune2Consumer = 'server' | 'client';

/**
 * Environment-target transform for `createIsomorphicFn().server(s).client(c)`.
 *
 * Replaces the chain with the selected consumer branch, or `() => {}` when
 * the selected branch is missing. Longer patterns are tried first; any match
 * nested inside an already-replaced range is skipped.
 */
const rules: {
  pattern: string;
  replace: (m: SgNode, consumer: Dune2Consumer) => string;
}[] = [
  {
    pattern: 'createIsomorphicFn().server($S).client($C)',
    replace: (m, consumer) =>
      consumer === 'server' ? m.getMatch('S')!.text() : m.getMatch('C')!.text(),
  },
  {
    pattern: 'createIsomorphicFn().client($C).server($S)',
    replace: (m, consumer) =>
      consumer === 'server' ? m.getMatch('S')!.text() : m.getMatch('C')!.text(),
  },
  {
    pattern: 'createIsomorphicFn().server($S)',
    replace: (m, consumer) =>
      consumer === 'server' ? m.getMatch('S')!.text() : '() => {}',
  },
  {
    pattern: 'createIsomorphicFn().client($C)',
    replace: (m, consumer) =>
      consumer === 'client' ? m.getMatch('C')!.text() : '() => {}',
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
  consumer: Dune2Consumer = 'server',
): void {
  const claimed: Array<[number, number]> = [];
  for (const { pattern, replace } of rules) {
    for (const node of root.findAll(pattern)) {
      const { start, end } = node.range();
      if (claimed.some(([s, e]) => start.index < e && end.index > s)) continue;
      claimed.push([start.index, end.index]);
      edits.push(node.replace(replace(node, consumer)));
    }
  }
}

export function compileCreateIsomorphicFn(
  code: string,
  filename: string,
  consumer: Dune2Consumer = 'server',
): string {
  const root = parse(detectLang(filename), code).root();
  const edits: Edit[] = [];
  createIsomorphicFnTransform(root, edits, filename, consumer);
  return root.commitEdits(edits);
}
