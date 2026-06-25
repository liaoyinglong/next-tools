import { type Edit, Lang, type SgNode, parse } from '@ast-grep/napi';

export type Dune2Consumer = 'server' | 'client';

export interface TransformContext {
  filename: string;
  consumer: Dune2Consumer;
}

export interface TransformRule {
  pattern: string;
  replace: (match: SgNode, context: TransformContext) => string;
}

export type RuleTransform = (
  root: SgNode,
  edits: Edit[],
  filename: string,
  consumer?: Dune2Consumer,
) => void;

export const TRIGGER =
  /\b(?:createIsomorphicFn|createServerOnlyFn|createClientOnlyFn)\b/;

export function detectLang(filename: string): Lang {
  if (/\.(tsx|jsx)$/.test(filename)) return Lang.Tsx;
  if (/\.(m|c)?ts$/.test(filename)) return Lang.TypeScript;
  return Lang.JavaScript;
}

export function applyRules(
  root: SgNode,
  edits: Edit[],
  rules: TransformRule[],
  context: TransformContext,
): void {
  const claimed: Array<[number, number]> = [];
  for (const { pattern, replace } of rules) {
    for (const node of root.findAll(pattern)) {
      const { start, end } = node.range();
      if (claimed.some(([s, e]) => start.index < e && end.index > s)) continue;
      claimed.push([start.index, end.index]);
      edits.push(node.replace(replace(node, context)));
    }
  }
}

export function createRuleTransform(rules: TransformRule[]): RuleTransform {
  return (root, edits, filename, consumer = 'server') => {
    applyRules(root, edits, rules, { filename, consumer });
  };
}

export function compileTransform(
  code: string,
  filename: string,
  transform: RuleTransform,
  consumer: Dune2Consumer = 'server',
): string {
  const root = parse(detectLang(filename), code).root();
  const edits: Edit[] = [];
  transform(root, edits, filename, consumer);
  return root.commitEdits(edits);
}
