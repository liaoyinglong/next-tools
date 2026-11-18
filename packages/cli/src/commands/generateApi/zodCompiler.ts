import { createLogger } from '../../shared';
import { resolveJsonPointer } from './schema';

const log = createLogger('generateApi');

const VALID_IDENTIFIER_RE = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

export interface CompileZodOptions {
  compatibleNumberString?: boolean;
}

export interface CompiledZodResult {
  code: string;
  helpers: string[];
}

interface ZodNode {
  expr: string;
  render: (childCodes: string[]) => string;
  children: ZodNode[];
  isBarePrimitive?: boolean;
}

function makeLeaf(expr: string, isBarePrimitive = false): ZodNode {
  return {
    expr,
    render: () => expr,
    children: [],
    isBarePrimitive,
  };
}

function makeNode(
  children: ZodNode[],
  render: (childCodes: string[]) => string,
): ZodNode {
  const expr = render(children.map((c) => c.expr));
  return { expr, render, children };
}

function formatPropertyKey(key: string): string {
  return VALID_IDENTIFIER_RE.test(key) ? key : JSON.stringify(key);
}

function compilePatternToRegExp(rawPattern: string): string | undefined {
  let body = rawPattern;
  let flags = '';

  const leadingFlagsMatch = body.match(/^\(\?([ims]+)\)/);
  if (leadingFlagsMatch) {
    flags = Array.from(new Set(leadingFlagsMatch[1].split(''))).join('');
    body = body.slice(leadingFlagsMatch[0].length);
  }

  try {
    new RegExp(body, flags);
  } catch {
    log.info('跳过不兼容 JS 的正则 pattern（%s）', rawPattern);
    return undefined;
  }

  return flags
    ? `new RegExp(${JSON.stringify(body)}, ${JSON.stringify(flags)})`
    : `new RegExp(${JSON.stringify(body)})`;
}

function compileString(node: Record<string, unknown>): ZodNode {
  let code = 'z.string()';
  let hasConstraint = false;
  if (typeof node.minLength === 'number') {
    code += `.min(${node.minLength})`;
    hasConstraint = true;
  }
  if (typeof node.maxLength === 'number') {
    code += `.max(${node.maxLength})`;
    hasConstraint = true;
  }
  if (typeof node.pattern === 'string') {
    const regExpExpr = compilePatternToRegExp(node.pattern);
    if (regExpExpr) {
      code += `.regex(${regExpExpr})`;
      hasConstraint = true;
    }
  }
  return makeLeaf(code, !hasConstraint);
}

function compileNumber(
  node: Record<string, unknown>,
  isInteger: boolean,
  compatibleNumberString: boolean,
): ZodNode {
  let numCode = 'z.number()';
  let hasConstraint = false;
  if (isInteger) {
    numCode += '.int()';
    hasConstraint = true;
  }
  if (typeof node.minimum === 'number') {
    numCode += `.min(${node.minimum})`;
    hasConstraint = true;
  }
  if (typeof node.maximum === 'number') {
    numCode += `.max(${node.maximum})`;
    hasConstraint = true;
  }

  const numNode = makeLeaf(numCode, !hasConstraint);
  if (!compatibleNumberString) {
    return numNode;
  }

  const strRegex = isInteger ? '/^-?\\d+$/' : '/^-?\\d+(\\.\\d+)?$/';
  const strNode = makeLeaf(`z.string().regex(${strRegex})`);
  return makeNode([numNode, strNode], ([n, s]) => `z.union([${n}, ${s}])`);
}

function compileEnum(values: unknown[]): ZodNode {
  if (values.length === 0) {
    return makeLeaf('z.never()', true);
  }
  if (values.every((item) => typeof item === 'string')) {
    return makeLeaf(
      `z.enum([${values.map((item) => JSON.stringify(item)).join(', ')}])`,
    );
  }
  if (values.length === 1) {
    return makeLeaf(`z.literal(${JSON.stringify(values[0])})`);
  }
  return makeLeaf(
    `z.union([${values.map((item) => `z.literal(${JSON.stringify(item)})`).join(', ')}])`,
  );
}

function extractSharedHelpers(root: ZodNode): CompiledZodResult {
  const candidates = new Map<string, ZodNode>();

  const collectCandidates = (node: ZodNode, isRoot: boolean) => {
    if (!isRoot && !node.isBarePrimitive) {
      if (!candidates.has(node.expr)) {
        candidates.set(node.expr, node);
      }
    }
    for (const child of node.children) {
      collectCandidates(child, false);
    }
  };
  collectCandidates(root, true);

  // 按表达式长度从长到短处理，优先抽离外层公共单元，避免内层被重复计数
  const sortedExprs = Array.from(candidates.keys()).sort(
    (a, b) => b.length - a.length,
  );

  const extracted = new Map<string, ZodNode>();

  const countActiveOccurrences = (targetExpr: string): number => {
    let count = 0;

    const visit = (node: ZodNode, isContainerRoot: boolean) => {
      if (!isContainerRoot) {
        if (node.expr === targetExpr) {
          count += 1;
          return;
        }
        if (extracted.has(node.expr)) {
          return;
        }
      }
      for (const child of node.children) {
        visit(child, false);
      }
    };

    visit(root, true);
    for (const helperNode of extracted.values()) {
      visit(helperNode, true);
    }
    return count;
  };

  for (const expr of sortedExprs) {
    if (countActiveOccurrences(expr) >= 2) {
      extracted.set(expr, candidates.get(expr)!);
    }
  }

  // 反序声明：先声明内层依赖，再声明外层组合
  const orderedEntries = Array.from(extracted.entries()).reverse();
  const varNames = new Map<string, string>();
  orderedEntries.forEach(([expr], index) => {
    varNames.set(expr, `_z${index}`);
  });

  const renderNode = (node: ZodNode, isContainerRoot: boolean): string => {
    if (!isContainerRoot) {
      const varName = varNames.get(node.expr);
      if (varName) {
        return varName;
      }
    }
    const childCodes = node.children.map((child) => renderNode(child, false));
    return node.render(childCodes);
  };

  const helpers = orderedEntries.map(([expr, node]) => {
    const varName = varNames.get(expr)!;
    return `const ${varName} = /*#__PURE__*/ ${renderNode(node, true)};`;
  });

  return {
    code: renderNode(root, true),
    helpers,
  };
}

/**
 * 将规范化后的 OpenAPI / JSON Schema 编译为 Zod v4 表达式（不生成 `.describe()`），
 * 并在单文件内自动抽离重复出现 ≥ 2 次的子表达式以减少运行时对象。
 */
export function compileZodSchema(
  rootSchema: unknown,
  options: CompileZodOptions = {},
): CompiledZodResult | undefined {
  if (!rootSchema || typeof rootSchema !== 'object') {
    return undefined;
  }

  const compatibleNumberString = Boolean(options.compatibleNumberString);
  const activeRefs = new Set<string>();
  const activeObjects = new WeakSet<object>();

  const compileNode = (node: unknown): ZodNode => {
    if (!node || typeof node !== 'object') {
      return makeLeaf('z.any()', true);
    }

    const record = node as Record<string, unknown>;

    if (typeof record.$ref === 'string') {
      const ref = record.$ref;
      if (activeRefs.has(ref)) {
        log.info('检测到循环 $ref（%s），Zod schema 已降级为 z.any()', ref);
        return makeLeaf('z.any()', true);
      }
      const resolved = resolveJsonPointer(rootSchema, ref);
      if (resolved === undefined) {
        log.info('未找到 $ref（%s），Zod schema 已降级为 z.any()', ref);
        return makeLeaf('z.any()', true);
      }
      activeRefs.add(ref);
      try {
        return compileNode(resolved);
      } finally {
        activeRefs.delete(ref);
      }
    }

    if (activeObjects.has(record)) {
      log.info('检测到循环引用对象，Zod schema 已降级为 z.any()');
      return makeLeaf('z.any()', true);
    }

    activeObjects.add(record);
    try {
      const base = compileUnwrapped(record);
      if (record.nullable === true && base.expr !== 'z.null()') {
        return makeNode([base], ([inner]) => `${inner}.nullable()`);
      }
      return base;
    } finally {
      activeObjects.delete(record);
    }
  };

  const compileByType = (
    typeName: string,
    record: Record<string, unknown>,
  ): ZodNode => {
    switch (typeName) {
      case 'string':
        return compileString(record);
      case 'integer':
        return compileNumber(record, true, compatibleNumberString);
      case 'number':
        return compileNumber(record, false, compatibleNumberString);
      case 'boolean':
        return makeLeaf('z.boolean()', true);
      case 'null':
        return makeLeaf('z.null()', true);
      case 'array': {
        const itemsNode = compileNode(record.items);
        let suffix = '';
        if (typeof record.minItems === 'number') {
          suffix += `.min(${record.minItems})`;
        }
        if (typeof record.maxItems === 'number') {
          suffix += `.max(${record.maxItems})`;
        }
        return makeNode([itemsNode], ([item]) => `z.array(${item})${suffix}`);
      }
      case 'object': {
        const properties = record.properties;
        if (
          properties &&
          typeof properties === 'object' &&
          !Array.isArray(properties)
        ) {
          const entries = Object.entries(properties as Record<string, unknown>);
          const requiredSet = new Set(
            Array.isArray(record.required)
              ? record.required.filter(
                  (r): r is string => typeof r === 'string',
                )
              : [],
          );
          const keys = entries.map(([key]) => formatPropertyKey(key));
          const propNodes = entries.map(([key, propSchema]) => {
            const propNode = compileNode(propSchema);
            return requiredSet.has(key)
              ? propNode
              : makeNode([propNode], ([inner]) => `${inner}.optional()`);
          });
          return makeNode(propNodes, (codes) => {
            const lines = codes.map((c, i) => `${keys[i]}: ${c}`);
            return `z.object({\n${lines.join(',\n')}\n})`;
          });
        }
        if (
          record.additionalProperties &&
          typeof record.additionalProperties === 'object'
        ) {
          const valNode = compileNode(record.additionalProperties);
          return makeNode([valNode], ([v]) => `z.record(z.string(), ${v})`);
        }
        return makeLeaf('z.record(z.string(), z.unknown())');
      }
      default:
        return makeLeaf('z.any()', true);
    }
  };

  const compileUnwrapped = (record: Record<string, unknown>): ZodNode => {
    if (Array.isArray(record.enum)) {
      return compileEnum(record.enum);
    }

    if ('const' in record) {
      return makeLeaf(`z.literal(${JSON.stringify(record.const)})`);
    }

    const unionBranches = Array.isArray(record.oneOf)
      ? record.oneOf
      : Array.isArray(record.anyOf)
        ? record.anyOf
        : undefined;
    if (unionBranches && unionBranches.length > 0) {
      const compiled = unionBranches.map(compileNode);
      return compiled.length === 1
        ? compiled[0]
        : makeNode(compiled, (codes) => `z.union([${codes.join(', ')}])`);
    }

    if (Array.isArray(record.allOf) && record.allOf.length > 0) {
      const compiled = record.allOf.map(compileNode);
      return compiled.reduce((acc, cur) =>
        makeNode([acc, cur], ([a, b]) => `z.intersection(${a}, ${b})`),
      );
    }

    if (Array.isArray(record.type)) {
      const hasNull = record.type.includes('null');
      const nonNullTypes = record.type.filter(
        (t): t is string => typeof t === 'string' && t !== 'null',
      );
      if (nonNullTypes.length === 0) {
        return makeLeaf('z.null()', true);
      }
      const compiled = nonNullTypes.map((t) => compileByType(t, record));
      const base =
        compiled.length === 1
          ? compiled[0]
          : makeNode(compiled, (codes) => `z.union([${codes.join(', ')}])`);
      return hasNull
        ? makeNode([base], ([inner]) => `${inner}.nullable()`)
        : base;
    }

    if (typeof record.type === 'string') {
      return compileByType(record.type, record);
    }

    if (record.properties && typeof record.properties === 'object') {
      return compileByType('object', record);
    }

    return makeLeaf('z.any()', true);
  };

  const rootNode = compileNode(rootSchema);
  return extractSharedHelpers(rootNode);
}
