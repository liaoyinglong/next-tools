import { type Edit, Lang, type SgNode, parse } from '@ast-grep/napi';
import MagicString from 'magic-string';

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
    // 这里刻意用字符串 matcher：@ast-grep/napi (0.40.5) 没有暴露预编译好的
    // pattern 句柄 —— pattern(lang, src) 只返回 { rule, language } 包装对象，
    // findAll 也不接受 SgNode 作为 matcher，实测与直接传字符串同速（native 侧
    // 每次调用都会编译一次）。所以别再包一层"预编译"，它不会省下任何工作。
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

export function collectTransformEdits(
  root: SgNode,
  transforms: RuleTransform[],
  filename: string,
  consumer: Dune2Consumer,
): Edit[] {
  const edits: Edit[] = [];
  for (const transform of transforms) {
    transform(root, edits, filename, consumer);
  }
  return edits;
}

export function compileTransform(
  code: string,
  filename: string,
  transform: RuleTransform,
  consumer: Dune2Consumer = 'server',
): string {
  const root = parse(detectLang(filename), code).root();
  const edits = collectTransformEdits(root, [transform], filename, consumer);
  return root.commitEdits(edits);
}

/**
 * 用 MagicString 重放 ast-grep edits 生成 sourcemap。
 *
 * 注意：@ast-grep/napi 的类型声明声称 Pos.index 是 UTF-8 字节偏移，
 * 但实际返回的是 UTF-16 码元索引（与 JS 字符串下标一致），可与
 * MagicString 直接配合，不要做字节换算。
 *
 * 重放结果与 commitEdits 产物做自校验，不一致（或异常）时返回 null，
 * 宁可没有 sourcemap 也不返回错误的映射。
 */
export function buildSourcemapFromEdits(
  code: string,
  transformed: string,
  edits: Edit[],
  id: string,
) {
  const ms = new MagicString(code);
  for (const { startPos, endPos, insertedText } of edits) {
    if (startPos === endPos) {
      ms.appendLeft(startPos, insertedText);
    } else {
      ms.overwrite(startPos, endPos, insertedText);
    }
  }
  if (ms.toString() !== transformed) {
    return null;
  }
  return ms.generateMap({ source: id, includeContent: true, hires: true });
}
