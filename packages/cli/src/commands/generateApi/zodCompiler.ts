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

interface CompatHelperSpec {
  token: string;
  varName: string;
  expr: string;
}

const COMPAT_HELPERS: Record<
  'intCompat' | 'numCompat' | 'intString' | 'numString',
  CompatHelperSpec
> = {
  intCompat: {
    token: '__DUNE_ZOD_INT_COMPAT__',
    varName: '_intCompat',
    expr: 'z.union([z.number().int(), z.string().regex(/^-?\\d+$/)])',
  },
  numCompat: {
    token: '__DUNE_ZOD_NUM_COMPAT__',
    varName: '_numCompat',
    expr: 'z.union([z.number(), z.string().regex(/^-?\\d+(\\.\\d+)?$/)])',
  },
  intString: {
    token: '__DUNE_ZOD_INT_STR__',
    varName: '_intString',
    expr: 'z.string().regex(/^-?\\d+$/)',
  },
  numString: {
    token: '__DUNE_ZOD_NUM_STR__',
    varName: '_numString',
    expr: 'z.string().regex(/^-?\\d+(\\.\\d+)?$/)',
  },
};

function formatPropertyKey(key: string): string {
  return VALID_IDENTIFIER_RE.test(key) ? key : JSON.stringify(key);
}

function compileString(node: Record<string, unknown>): string {
  let code = 'z.string()';
  if (typeof node.minLength === 'number') {
    code += `.min(${node.minLength})`;
  }
  if (typeof node.maxLength === 'number') {
    code += `.max(${node.maxLength})`;
  }
  if (typeof node.pattern === 'string') {
    code += `.regex(new RegExp(${JSON.stringify(node.pattern)}))`;
  }
  return code;
}

function compileNumber(
  node: Record<string, unknown>,
  isInteger: boolean,
  compatibleNumberString: boolean,
  useHelperToken: (key: keyof typeof COMPAT_HELPERS) => string,
): string {
  const hasMin = typeof node.minimum === 'number';
  const hasMax = typeof node.maximum === 'number';

  let numCode = 'z.number()';
  if (isInteger) {
    numCode += '.int()';
  }
  if (hasMin) {
    numCode += `.min(${node.minimum})`;
  }
  if (hasMax) {
    numCode += `.max(${node.maximum})`;
  }

  if (!compatibleNumberString) {
    return numCode;
  }

  if (!hasMin && !hasMax) {
    return useHelperToken(isInteger ? 'intCompat' : 'numCompat');
  }

  const strToken = useHelperToken(isInteger ? 'intString' : 'numString');
  return `z.union([${numCode}, ${strToken}])`;
}

function compileEnum(values: unknown[]): string {
  if (values.length === 0) {
    return 'z.never()';
  }
  if (values.every((item) => typeof item === 'string')) {
    return `z.enum([${values.map((item) => JSON.stringify(item)).join(', ')}])`;
  }
  if (values.length === 1) {
    return `z.literal(${JSON.stringify(values[0])})`;
  }
  return `z.union([${values.map((item) => `z.literal(${JSON.stringify(item)})`).join(', ')}])`;
}

/**
 * 将规范化后的 OpenAPI / JSON Schema 编译为 Zod v4 表达式（不生成 `.describe()`）。
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
  const helperCounts = new Map<keyof typeof COMPAT_HELPERS, number>();

  const useHelperToken = (key: keyof typeof COMPAT_HELPERS) => {
    helperCounts.set(key, (helperCounts.get(key) ?? 0) + 1);
    return COMPAT_HELPERS[key].token;
  };

  const compileNode = (node: unknown): string => {
    if (!node || typeof node !== 'object') {
      return 'z.any()';
    }

    const record = node as Record<string, unknown>;

    if (typeof record.$ref === 'string') {
      const ref = record.$ref;
      if (activeRefs.has(ref)) {
        log.info('检测到循环 $ref（%s），Zod schema 已降级为 z.any()', ref);
        return 'z.any()';
      }
      const resolved = resolveJsonPointer(rootSchema, ref);
      if (resolved === undefined) {
        log.info('未找到 $ref（%s），Zod schema 已降级为 z.any()', ref);
        return 'z.any()';
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
      return 'z.any()';
    }

    activeObjects.add(record);
    try {
      let expr = compileUnwrapped(record);
      if (record.nullable === true && expr !== 'z.null()') {
        expr += '.nullable()';
      }
      return expr;
    } finally {
      activeObjects.delete(record);
    }
  };

  const compileByType = (
    typeName: string,
    record: Record<string, unknown>,
  ): string => {
    switch (typeName) {
      case 'string':
        return compileString(record);
      case 'integer':
        return compileNumber(
          record,
          true,
          compatibleNumberString,
          useHelperToken,
        );
      case 'number':
        return compileNumber(
          record,
          false,
          compatibleNumberString,
          useHelperToken,
        );
      case 'boolean':
        return 'z.boolean()';
      case 'null':
        return 'z.null()';
      case 'array': {
        let code = `z.array(${compileNode(record.items)})`;
        if (typeof record.minItems === 'number') {
          code += `.min(${record.minItems})`;
        }
        if (typeof record.maxItems === 'number') {
          code += `.max(${record.maxItems})`;
        }
        return code;
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
          const lines = entries.map(([key, propSchema]) => {
            const propExpr = compileNode(propSchema);
            const optionalExpr = requiredSet.has(key)
              ? propExpr
              : `${propExpr}.optional()`;
            return `${formatPropertyKey(key)}: ${optionalExpr}`;
          });
          return `z.object({\n${lines.join(',\n')}\n})`;
        }
        if (
          record.additionalProperties &&
          typeof record.additionalProperties === 'object'
        ) {
          return `z.record(z.string(), ${compileNode(record.additionalProperties)})`;
        }
        return 'z.record(z.string(), z.unknown())';
      }
      default:
        return 'z.any()';
    }
  };

  const compileUnwrapped = (record: Record<string, unknown>): string => {
    if (Array.isArray(record.enum)) {
      return compileEnum(record.enum);
    }

    if ('const' in record) {
      return `z.literal(${JSON.stringify(record.const)})`;
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
        : `z.union([${compiled.join(', ')}])`;
    }

    if (Array.isArray(record.allOf) && record.allOf.length > 0) {
      const compiled = record.allOf.map(compileNode);
      return compiled.reduce((acc, cur) => `z.intersection(${acc}, ${cur})`);
    }

    if (Array.isArray(record.type)) {
      const hasNull = record.type.includes('null');
      const nonNullTypes = record.type.filter(
        (t): t is string => typeof t === 'string' && t !== 'null',
      );
      if (nonNullTypes.length === 0) {
        return 'z.null()';
      }
      const compiled = nonNullTypes.map((t) => compileByType(t, record));
      const base =
        compiled.length === 1
          ? compiled[0]
          : `z.union([${compiled.join(', ')}])`;
      return hasNull ? `${base}.nullable()` : base;
    }

    if (typeof record.type === 'string') {
      return compileByType(record.type, record);
    }

    if (record.properties && typeof record.properties === 'object') {
      return compileByType('object', record);
    }

    return 'z.any()';
  };

  let code = compileNode(rootSchema);
  const helpers: string[] = [];

  for (const [key, spec] of Object.entries(COMPAT_HELPERS) as [
    keyof typeof COMPAT_HELPERS,
    CompatHelperSpec,
  ][]) {
    const count = helperCounts.get(key) ?? 0;
    if (count === 0) continue;

    if (count >= 2) {
      helpers.push(`const ${spec.varName} = /*#__PURE__*/ ${spec.expr};`);
      code = code.split(spec.token).join(spec.varName);
    } else {
      code = code.split(spec.token).join(spec.expr);
    }
  }

  return { code, helpers };
}
