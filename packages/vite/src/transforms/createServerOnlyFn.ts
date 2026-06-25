import { type Edit, type SgNode, parse } from '@ast-grep/napi';
import type { Dune2Consumer } from './createIsomorphicFn';
import { detectLang } from './shared';

const SERVER_ONLY_ERROR =
  'createServerOnlyFn() functions can only be called on the server!';

const rules: {
  pattern: string;
  replace: (m: SgNode, consumer: Dune2Consumer) => string;
}[] = [
  {
    pattern: 'createServerOnlyFn($F)',
    replace: (m, consumer) =>
      consumer === 'server'
        ? m.getMatch('F')!.text()
        : `() => { throw new Error("${SERVER_ONLY_ERROR}"); }`,
  },
];

export function createServerOnlyFnTransform(
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

export function compileCreateServerOnlyFn(
  code: string,
  filename: string,
  consumer: Dune2Consumer = 'server',
): string {
  const root = parse(detectLang(filename), code).root();
  const edits: Edit[] = [];
  createServerOnlyFnTransform(root, edits, filename, consumer);
  return root.commitEdits(edits);
}
