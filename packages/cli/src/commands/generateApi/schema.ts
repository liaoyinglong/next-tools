import type { OpenAPIV3 } from 'openapi-types';
import type { ApiConfig } from '../../shared/config';
import type { ParsedDocument } from './context';

export function isCompatibleNumberStringEnabled(
  option: ApiConfig['compatibleNumberString'],
  target: 'req' | 'res',
): boolean {
  if (!option) return false;
  if (typeof option === 'boolean') return option;
  return Boolean(option[target]);
}

function decodePointerSegment(segment: string) {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

export function resolveJsonPointer(root: unknown, ref: string): unknown {
  if (!ref.startsWith('#/')) return undefined;
  const parts = ref.slice(2).split('/').map(decodePointerSegment);
  let cur: unknown = root;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function cloneSchemaDeep<T>(
  value: T,
  seen = new WeakMap<object, unknown>(),
): T {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return seen.get(value) as T;
  }
  if (Array.isArray(value)) {
    const arr: unknown[] = [];
    seen.set(value, arr);
    for (const item of value) {
      arr.push(cloneSchemaDeep(item, seen));
    }
    return arr as T;
  }
  const cloned: Record<string, unknown> = {};
  seen.set(value, cloned);
  for (const [k, v] of Object.entries(value)) {
    cloned[k] = cloneSchemaDeep(v, seen);
  }
  return cloned as T;
}

/**
 * 将非枚举的 `number` / `integer` 字段扩宽为 `['number', 'string']`，
 * 仅作用于克隆后的临时 schema，避免污染共享的 Swagger 解析结果。
 * 注：不处理数字枚举（按约定不会出现数字枚举）。
 */
export function widenNumberToStringDeep(
  value: unknown,
  seen = new WeakSet<object>(),
) {
  if (!value || typeof value !== 'object' || seen.has(value)) {
    return;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => widenNumberToStringDeep(item, seen));
    return;
  }

  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.enum)) {
    if (record.type === 'number' || record.type === 'integer') {
      record.type = ['number', 'string'];
    } else if (
      Array.isArray(record.type) &&
      (record.type.includes('number') || record.type.includes('integer'))
    ) {
      const normalized = record.type.map((item) =>
        item === 'integer' ? 'number' : item,
      );
      if (!normalized.includes('string')) {
        normalized.push('string');
      }
      record.type = Array.from(new Set(normalized));
    }
  }

  Object.values(record).forEach((item) => widenNumberToStringDeep(item, seen));
}

function isJsonContentType(contentType: string) {
  const mediaType = contentType.split(';', 1)[0].trim().toLowerCase();
  return (
    mediaType === 'application/json' ||
    mediaType === '*/*' ||
    mediaType.endsWith('/json') ||
    mediaType.endsWith('+json')
  );
}

export function pickJsonMedia(
  content: Record<string, OpenAPIV3.MediaTypeObject> | undefined,
) {
  if (!content) return undefined;
  return (
    content['application/json'] ??
    content['*/*'] ??
    Object.entries(content).find(([contentType]) =>
      isJsonContentType(contentType),
    )?.[1]
  );
}

export function getRequestBodySchema(
  requestBody:
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.RequestBodyObject
    | undefined,
) {
  if (!requestBody) return undefined;
  if ('$ref' in requestBody) return requestBody;
  return pickJsonMedia(requestBody.content)?.schema;
}

export function pickSuccessResponse(responses: OpenAPIV3.ResponsesObject) {
  return responses['200'];
}

/**
 * 只收集 rootSchema 里真正引用到的 `$ref`（含传递依赖），
 * 构造一个最小化的定义上下文。
 *
 * 之前是把整个 components/definitions 直接挂到每个待编译的 schema 上，
 * 导致类型生成器每次都要遍历整份 API 的类型图，
 * 261 个接口 × 2（Req/Res）= 522 次全量遍历，非常慢。
 * 这里改为按需收集可达定义，输出结果不变，但速度大幅提升。
 */
export function buildRefContext(
  rootSchema: unknown,
  parsed: ParsedDocument | undefined,
): Record<string, unknown> {
  const context: Record<string, unknown> = {};
  if (!parsed || !rootSchema || typeof rootSchema !== 'object') {
    return context;
  }

  const seen = new Set<string>();
  const queue: string[] = [];

  const collectRefs = (obj: unknown) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(collectRefs);
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (
        key === '$ref' &&
        typeof value === 'string' &&
        value.startsWith('#/')
      ) {
        queue.push(value);
      } else {
        collectRefs(value);
      }
    }
  };

  const decodeSegment = (segment: string) =>
    segment.replace(/~1/g, '/').replace(/~0/g, '~');

  const resolvePointer = (ref: string) => {
    const parts = ref.slice(2).split('/').map(decodeSegment);
    let cur: unknown = parsed;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return undefined;
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur === undefined ? undefined : { parts, value: cur };
  };

  const setPointer = (parts: string[], value: unknown) => {
    let cur = context;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!cur[part] || typeof cur[part] !== 'object') {
        cur[part] = {};
      }
      cur = cur[part] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  };

  collectRefs(rootSchema);
  while (queue.length) {
    const ref = queue.shift()!;
    if (seen.has(ref)) continue;
    seen.add(ref);
    const resolved = resolvePointer(ref);
    if (!resolved) continue;
    setPointer(resolved.parts, resolved.value);
    collectRefs(resolved.value);
  }

  return context;
}

export function normalizeSchemaForGenerationDeep(value: unknown) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => normalizeSchemaForGenerationDeep(item));
    return;
  }

  const record = value as Record<string, unknown>;
  if ('default' in record) {
    delete record.default;
  }

  // Some Swagger generators copy an item's string enum onto its array schema.
  // JSON Schema requires enum values there to be arrays; keep only valid values.
  if (record.type === 'array' && Array.isArray(record.enum)) {
    const arrayEnum = record.enum.filter(Array.isArray);
    if (arrayEnum.length > 0) {
      record.enum = arrayEnum;
    } else {
      delete record.enum;
    }
  }

  Object.values(record).forEach((item) =>
    normalizeSchemaForGenerationDeep(item),
  );
}
