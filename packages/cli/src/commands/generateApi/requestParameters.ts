import { camelCase, isPlainObject } from 'es-toolkit';
import type { OpenAPIV3 } from 'openapi-types';
import { asyncLocalStorage, type SwaggerParseState } from './context';
import { pickJsonMedia, resolveJsonPointer } from './schema';

const QUERY_DEFAULT_METHODS = new Set(['get', 'head', 'options']);
const OPTIONAL_PAGINATION_QUERY_PARAMS = new Set([
  'pageNum',
  'pageSize',
  'count',
]);
const JS_IDENTIFIER_RE = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
const JS_RESERVED_WORDS = new Set(
  'await break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public return static super switch this throw true try typeof var void while with yield'.split(
    ' ',
  ),
);

export interface ParsedPathParam {
  /** OpenAPI 原始 path 参数名（对应 url 模板中的 {name}） */
  name: string;
  /** 拍平到 Req 输入对象的字段名（重名时会改名为 pathXxx） */
  alias: string;
  required: boolean;
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  description?: string;
}

export interface ParsedQueryParam {
  name: string;
  required: boolean;
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  description?: string;
}

export type ParsedRequestBody =
  | { kind: 'none' }
  | {
      kind: 'object';
      required: boolean;
      schema: OpenAPIV3.NonArraySchemaObject;
    }
  | {
      kind: 'wrapped';
      required: boolean;
      schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
    }
  | {
      kind: 'non-json';
      required: boolean;
      tsType: 'FormData' | 'string' | 'unknown';
    };

export interface ParsedRequestParameters {
  path: ParsedPathParam[];
  query: ParsedQueryParam[];
  body: ParsedRequestBody;
}

function resolveRef<T>(
  value: T | OpenAPIV3.ReferenceObject | undefined,
  store: SwaggerParseState | undefined,
): T | undefined {
  let current: unknown = value;
  const seen = new Set<string>();
  while (
    isPlainObject(current) &&
    '$ref' in current &&
    typeof current.$ref === 'string'
  ) {
    if (seen.has(current.$ref)) return undefined;
    seen.add(current.$ref);
    const resolved =
      store?.parser?.$refs?.get?.(current.$ref) ??
      resolveJsonPointer(store?.parsed, current.$ref);
    if (resolved === undefined) return undefined;
    current = resolved;
  }
  return current as T | undefined;
}

function isFlattenableObjectSchema(
  schema: unknown,
): schema is OpenAPIV3.NonArraySchemaObject {
  if (!isPlainObject(schema) || schema.oneOf || schema.anyOf || schema.allOf) {
    return false;
  }
  return (
    isPlainObject(schema.properties) &&
    Object.keys(schema.properties).length > 0
  );
}

function parseRequestBody(
  rawRequestBody: OpenAPIV3.OperationObject['requestBody'],
  store: SwaggerParseState | undefined,
): ParsedRequestBody {
  const requestBody = resolveRef<OpenAPIV3.RequestBodyObject>(
    rawRequestBody,
    store,
  );
  if (!requestBody?.content || Object.keys(requestBody.content).length === 0) {
    return { kind: 'none' };
  }

  const required = Boolean(requestBody.required);
  const jsonMedia = pickJsonMedia(requestBody.content);
  if (!jsonMedia) {
    const mediaTypes = Object.keys(requestBody.content).map((ct) =>
      ct.split(';', 1)[0].trim().toLowerCase(),
    );
    const tsType = mediaTypes.some((mt) => mt.startsWith('multipart/'))
      ? 'FormData'
      : mediaTypes.some((mt) => mt.startsWith('text/'))
        ? 'string'
        : 'unknown';
    return { kind: 'non-json', required, tsType };
  }

  if (!jsonMedia.schema) {
    return { kind: 'none' };
  }

  const resolvedSchema = resolveRef<OpenAPIV3.SchemaObject>(
    jsonMedia.schema,
    store,
  );
  return isFlattenableObjectSchema(resolvedSchema)
    ? { kind: 'object', required, schema: resolvedSchema }
    : { kind: 'wrapped', required, schema: jsonMedia.schema };
}

export function parseRequestParameters(
  operationObject: OpenAPIV3.OperationObject,
  pathItemParameters?: (
    | OpenAPIV3.ParameterObject
    | OpenAPIV3.ReferenceObject
  )[],
  store: SwaggerParseState | undefined = asyncLocalStorage.getStore(),
): ParsedRequestParameters {
  // 1. 合并 path-item 与 operation 参数（同 in + name 时 operation 覆盖 path-item）
  const mergedParams = new Map<string, OpenAPIV3.ParameterObject>();
  for (const list of [pathItemParameters, operationObject.parameters]) {
    for (const raw of list ?? []) {
      const param = resolveRef<OpenAPIV3.ParameterObject>(raw, store);
      if (param?.name && param.in) {
        mergedParams.set(`${param.in}:${param.name}`, param);
      }
    }
  }

  // 2. 分离 path 与 query 参数
  const path: ParsedPathParam[] = [];
  const query: ParsedQueryParam[] = [];
  const queryNames = new Set<string>();
  const addQueryParam = (item: ParsedQueryParam) => {
    if (queryNames.has(item.name)) {
      throw new Error(
        `Duplicate query parameter name after flattening: "${item.name}"`,
      );
    }
    queryNames.add(item.name);
    query.push(item);
  };

  for (const param of mergedParams.values()) {
    if (param.in === 'path') {
      path.push({
        name: param.name,
        alias: param.name,
        required: param.required ?? true,
        schema: param.schema ?? { type: 'string' },
        description: param.description,
      });
    } else if (param.in === 'query' && param.schema) {
      const resolved = resolveRef<OpenAPIV3.SchemaObject>(param.schema, store);
      if (
        param.style !== 'deepObject' &&
        resolved &&
        'type' in resolved &&
        resolved.type === 'object'
      ) {
        const requiredSet = new Set(resolved.required ?? []);
        for (const [propName, propSchema] of Object.entries(
          resolved.properties ?? {},
        )) {
          addQueryParam({
            name: propName,
            required: requiredSet.has(propName),
            schema: propSchema,
          });
        }
      } else {
        addQueryParam({
          name: param.name,
          required: Boolean(
            param.required && !OPTIONAL_PAGINATION_QUERY_PARAMS.has(param.name),
          ),
          schema: param.schema,
          description: param.description,
        });
      }
    }
  }

  // 3. 解析 requestBody
  const body = parseRequestBody(operationObject.requestBody, store);

  // 4. 重名检查与 path 改名（pathXxx）
  const hasPathOrQuery = path.length > 0 || query.length > 0;
  const bodyNames = new Set(
    body.kind === 'object'
      ? Object.keys(body.schema.properties ?? {})
      : body.kind !== 'none' && hasPathOrQuery
        ? ['body']
        : [],
  );

  for (const name of queryNames) {
    if (bodyNames.has(name)) {
      throw new Error(
        `Parameter name conflict between query and body: "${name}"`,
      );
    }
  }

  const occupied = new Set([...queryNames, ...bodyNames]);
  const rawPathNames = new Set(path.map((p) => p.name));
  const usedAliases = new Set<string>();

  for (const p of path) {
    if (!occupied.has(p.name) && !usedAliases.has(p.name)) {
      usedAliases.add(p.name);
      continue;
    }
    const renamed = `path${p.name.charAt(0).toUpperCase()}${p.name.slice(1)}`;
    if (
      occupied.has(renamed) ||
      usedAliases.has(renamed) ||
      (rawPathNames.has(renamed) && renamed !== p.name)
    ) {
      throw new Error(
        `Parameter name conflict for path "${p.name}": renamed alias "${renamed}" also conflicts`,
      );
    }
    p.alias = renamed;
    usedAliases.add(renamed);
  }

  return { path, query, body };
}

export function shouldOmitToRequest(
  parsed: ParsedRequestParameters,
  method: string,
): boolean {
  const hasPath = parsed.path.length > 0;
  const hasQuery = parsed.query.length > 0;
  const hasBody = parsed.body.kind !== 'none';
  if (parsed.path.some((p) => p.alias !== p.name)) return false;

  const isQueryDefault = QUERY_DEFAULT_METHODS.has(method.toLowerCase());
  if (isQueryDefault ? hasBody : hasQuery) return false;

  const isWrappedBody =
    parsed.body.kind === 'wrapped' || parsed.body.kind === 'non-json';
  return !(isWrappedBody && (hasPath || hasQuery));
}

const isValidJsIdentifier = (name: string) =>
  JS_IDENTIFIER_RE.test(name) && !JS_RESERVED_WORDS.has(name);

const formatPropertyKey = (key: string) =>
  JS_IDENTIFIER_RE.test(key)
    ? key
    : `'${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const formatObjectEntry = (key: string, localVar: string) =>
  JS_IDENTIFIER_RE.test(key) && key === localVar
    ? key
    : `${formatPropertyKey(key)}: ${localVar}`;

export function generateToRequestCode(
  parsed: ParsedRequestParameters,
  method: string,
): string {
  if (shouldOmitToRequest(parsed, method)) return '';

  const hasPath = parsed.path.length > 0;
  const hasQuery = parsed.query.length > 0;
  const hasBody = parsed.body.kind !== 'none';

  if (!hasPath && hasQuery && !hasBody) {
    return 'toRequest: (query) => ({ query }),';
  }
  if (!hasPath && !hasQuery && hasBody) {
    return 'toRequest: (body) => ({ body }),';
  }

  const useRestQuery = hasPath && hasQuery && !hasBody;
  const useRestBody = parsed.body.kind === 'object';
  const useWrappedBody =
    parsed.body.kind === 'wrapped' || parsed.body.kind === 'non-json';

  const reservedRest = new Set<string>();
  if (useRestQuery) reservedRest.add('query');
  if (useRestBody) reservedRest.add('body');

  const candidateNames = [
    ...parsed.path.map((p) => p.alias),
    ...(useRestQuery ? [] : parsed.query.map((q) => q.name)),
  ];
  const usedLocals = new Set<string>([
    ...reservedRest,
    ...(useWrappedBody ? ['body'] : []),
    ...candidateNames.filter(
      (n) => isValidJsIdentifier(n) && !reservedRest.has(n),
    ),
  ]);

  const allocateLocal = (propName: string): string => {
    if (isValidJsIdentifier(propName) && !reservedRest.has(propName)) {
      return propName;
    }
    let base = camelCase(propName);
    if (!base || !isValidJsIdentifier(base)) base = `_${base || 'param'}`;
    let candidate = base;
    for (let i = 2; usedLocals.has(candidate); i++) {
      candidate = `${base}${i}`;
    }
    usedLocals.add(candidate);
    return candidate;
  };

  const destructure: string[] = [];
  const pathEntries: string[] = [];
  const queryEntries: string[] = [];

  for (const p of parsed.path) {
    const localVar = allocateLocal(p.alias);
    destructure.push(formatObjectEntry(p.alias, localVar));
    pathEntries.push(formatObjectEntry(p.name, localVar));
  }

  if (useRestQuery) {
    destructure.push('...query');
  } else {
    for (const q of parsed.query) {
      const localVar = allocateLocal(q.name);
      destructure.push(formatObjectEntry(q.name, localVar));
      queryEntries.push(formatObjectEntry(q.name, localVar));
    }
  }

  if (useRestBody) destructure.push('...body');
  else if (useWrappedBody) destructure.push('body');

  const returns = [
    hasPath && `path: { ${pathEntries.join(', ')} }`,
    useRestQuery
      ? 'query'
      : hasQuery && `query: { ${queryEntries.join(', ')} }`,
    hasBody && 'body',
  ].filter(Boolean);

  return `toRequest: ({ ${destructure.join(', ')} }) => ({ ${returns.join(', ')} }),`;
}
