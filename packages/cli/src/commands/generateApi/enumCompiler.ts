import { camelCase } from 'es-toolkit';
import type { ApiConfig } from '../../shared/config';
import { resolveJsonPointer } from './schema';

const VALID_IDENTIFIER_RE = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

export function isEnumsEnabled(
  option: ApiConfig['enableEnums'],
  target: 'req' | 'res',
): boolean {
  if (!option) return false;
  if (typeof option === 'boolean') return option;
  return Boolean(option[target]);
}

function formatPropertyKey(key: string): string {
  return VALID_IDENTIFIER_RE.test(key) ? key : JSON.stringify(key);
}

function toFlatEnumKey(pathSegments: string[]): string {
  if (pathSegments.length === 0) {
    return 'value';
  }
  const joined = camelCase(pathSegments.join('_'));
  return joined || 'value';
}

/**
 * 从规范化后的 OpenAPI / JSON Schema 中递归收集枚举值，
 * 按扁平驼峰命名生成对象字面量（如 `{ status: ['ACTIVE', 'INACTIVE'] }`）。
 */
export function compileEnumObject(rootSchema: unknown): string | undefined {
  if (!rootSchema || typeof rootSchema !== 'object') {
    return undefined;
  }

  const activeRefs = new Set<string>();
  const activeObjects = new WeakSet<object>();
  const collected = new Map<string, (string | number)[]>();

  const addEnum = (pathSegments: string[], rawValues: unknown[]) => {
    const values = Array.from(
      new Set(
        rawValues.filter(
          (v): v is string | number =>
            typeof v === 'string' || typeof v === 'number',
        ),
      ),
    );
    if (values.length === 0) return;

    const baseKey = toFlatEnumKey(pathSegments);
    const serialized = JSON.stringify(values);

    let key = baseKey;
    let suffix = 2;
    while (collected.has(key)) {
      if (JSON.stringify(collected.get(key)) === serialized) {
        return;
      }
      key = `${baseKey}${suffix++}`;
    }
    collected.set(key, values);
  };

  const visit = (node: unknown, pathSegments: string[]) => {
    if (!node || typeof node !== 'object') {
      return;
    }

    const record = node as Record<string, unknown>;

    if (typeof record.$ref === 'string') {
      const ref = record.$ref;
      if (activeRefs.has(ref)) {
        return;
      }
      const resolved = resolveJsonPointer(rootSchema, ref);
      if (resolved === undefined) {
        return;
      }
      activeRefs.add(ref);
      try {
        visit(resolved, pathSegments);
      } finally {
        activeRefs.delete(ref);
      }
      return;
    }

    if (activeObjects.has(record)) {
      return;
    }

    activeObjects.add(record);
    try {
      if (Array.isArray(record.enum)) {
        addEnum(pathSegments, record.enum);
      }

      if (
        record.properties &&
        typeof record.properties === 'object' &&
        !Array.isArray(record.properties)
      ) {
        for (const [propName, propSchema] of Object.entries(
          record.properties as Record<string, unknown>,
        )) {
          visit(propSchema, [...pathSegments, propName]);
        }
      }

      if (record.items && typeof record.items === 'object') {
        visit(record.items, pathSegments);
      }

      if (
        record.additionalProperties &&
        typeof record.additionalProperties === 'object'
      ) {
        visit(record.additionalProperties, pathSegments);
      }

      for (const combinator of ['oneOf', 'anyOf', 'allOf'] as const) {
        const branches = record[combinator];
        if (Array.isArray(branches)) {
          branches.forEach((branch) => visit(branch, pathSegments));
        }
      }
    } finally {
      activeObjects.delete(record);
    }
  };

  visit(rootSchema, []);

  if (collected.size === 0) {
    return undefined;
  }

  const lines = Array.from(collected.entries()).map(
    ([key, values]) =>
      `  ${formatPropertyKey(key)}: [${values.map((v) => JSON.stringify(v)).join(', ')}],`,
  );
  return `{\n${lines.join('\n')}\n}`;
}
