import { type Edit, type SgNode, parse } from '@ast-grep/napi';
import { detectLang } from './shared';

/**
 * Server-target transform for `createIsomorphicFn().server(s).client(c)`.
 *
 * Walks up from each `createIsomorphicFn()` seed through alternating
 * member_expression → call_expression parents, collecting the argument
 * passed to `.server(...)` (last write wins). Replaces the outermost
 * chain expression with the server arg, or `() => {}` if absent.
 */
export function createIsomorphicFnTransform(
  root: SgNode,
  edits: Edit[],
  _filename: string,
): void {
  const seeds = root.findAll('createIsomorphicFn()');
  for (const seed of seeds) {
    let outer: SgNode = seed;
    let serverArg: SgNode | null = null;

    while (true) {
      const member = outer.parent();
      if (!member || member.kind() !== 'member_expression') break;
      const obj = member.field('object');
      if (!obj || !rangeEq(obj.range(), outer.range())) break;
      const prop = member.field('property');
      if (!prop) break;
      const propName = prop.text();

      const call = member.parent();
      if (!call || call.kind() !== 'call_expression') break;
      const callee = call.field('function');
      if (!callee || !rangeEq(callee.range(), member.range())) break;

      if (propName === 'server') {
        const args = call.field('arguments');
        const first = args ? firstNonPunct(args) : null;
        if (first) serverArg = first;
      }
      outer = call;
    }

    const replacement = serverArg ? serverArg.text() : '() => {}';
    edits.push(outer.replace(replacement));
  }
}

function rangeEq(
  a: ReturnType<SgNode['range']>,
  b: ReturnType<SgNode['range']>,
): boolean {
  return a.start.index === b.start.index && a.end.index === b.end.index;
}

function firstNonPunct(args: SgNode): SgNode | null {
  for (const child of args.children()) {
    const k = child.kind();
    if (k === '(' || k === ')' || k === ',') continue;
    return child;
  }
  return null;
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

export default createIsomorphicFnTransform;
