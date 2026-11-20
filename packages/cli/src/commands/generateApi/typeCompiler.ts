import { generate } from '@fumari/json-schema-ts';
import type { OpenAPIV3 } from 'openapi-types';
import { createLogger } from '../../shared';
import type { ApiConfig } from '../../shared/config';
import { asyncLocalStorage } from './context';
import { compileEnumObject } from './enumCompiler';
import {
  parseRequestParameters,
  type ParsedRequestParameters,
} from './requestParameters';
import {
  buildRefContext,
  cloneSchemaDeep,
  isTargetOptionEnabled,
  normalizeSchemaForGenerationDeep,
  pickJsonMedia,
  pickSuccessResponse,
  uppercaseEnumsDeep,
  widenNumberToStringDeep,
} from './schema';

const log = createLogger('generateApi');

const NON_JSON_BODY_SENTINELS = {
  FormData: '__DUNE_TS_TYPE_FORMDATA__',
  unknown: '__DUNE_TS_TYPE_UNKNOWN__',
} as const;

function prepareTargetSchema<T extends object>(
  finalSchema: T,
  apiConfig: ApiConfig | undefined,
  target: 'req' | 'res',
): T {
  const compatNumber = isTargetOptionEnabled(
    apiConfig?.compatibleNumberString,
    target,
  );
  const uppercaseEnums = isTargetOptionEnabled(
    apiConfig?.uppercaseEnums,
    target,
  );

  if (!compatNumber && !uppercaseEnums) {
    return finalSchema;
  }

  const cloned = cloneSchemaDeep(finalSchema);
  if (compatNumber) {
    widenNumberToStringDeep(cloned);
  }
  if (uppercaseEnums) {
    uppercaseEnumsDeep(cloned);
  }
  return cloned;
}

function replaceNonJsonSentinels(code: string): string {
  return code
    .replace(
      new RegExp(`['"]${NON_JSON_BODY_SENTINELS.FormData}['"]`, 'g'),
      'FormData',
    )
    .replace(
      new RegExp(`['"]${NON_JSON_BODY_SENTINELS.unknown}['"]`, 'g'),
      'unknown',
    );
}

function withDescription(
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  description?: string,
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject {
  return description && !('$ref' in schema)
    ? { ...schema, description }
    : schema;
}

/**
 * 基于已解析的请求参数（path / query / body）编译 Req 类型与枚举常量
 */
export async function compileRequestParams(
  operationObject: OpenAPIV3.OperationObject,
  apiConfig?: ApiConfig,
  parsedParams?: ParsedRequestParameters,
) {
  const store = asyncLocalStorage.getStore();
  const parsed = parsedParams ?? parseRequestParameters(operationObject);
  const hasPathOrQuery = parsed.path.length > 0 || parsed.query.length > 0;

  if (!hasPathOrQuery && parsed.body.kind === 'non-json') {
    return {
      code: `export type Req = ${parsed.body.tsType};`,
      enumsCode: undefined,
    };
  }

  let schemaObject:
    | OpenAPIV3.SchemaObject
    | OpenAPIV3.ReferenceObject
    | undefined;
  let hasNonJsonBodySentinel = false;

  if (!hasPathOrQuery) {
    if (parsed.body.kind === 'object' || parsed.body.kind === 'wrapped') {
      schemaObject = parsed.body.schema;
    }
  } else {
    const properties: Record<
      string,
      OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
    > = {};
    const required: string[] = [];

    if (parsed.body.kind === 'object') {
      Object.assign(properties, parsed.body.schema.properties ?? {});
      required.push(...(parsed.body.schema.required ?? []));
    } else if (parsed.body.kind === 'wrapped') {
      properties.body = parsed.body.schema;
      if (parsed.body.required) required.push('body');
    } else if (parsed.body.kind === 'non-json') {
      if (parsed.body.tsType === 'string') {
        properties.body = { type: 'string' };
      } else {
        hasNonJsonBodySentinel = true;
        properties.body = {
          type: 'string',
          enum: [NON_JSON_BODY_SENTINELS[parsed.body.tsType]],
        };
      }
      if (parsed.body.required) required.push('body');
    }

    for (const q of parsed.query) {
      properties[q.name] = withDescription(q.schema, q.description);
      if (q.required) required.push(q.name);
    }
    for (const p of parsed.path) {
      properties[p.alias] = withDescription(p.schema, p.description);
      if (p.required) required.push(p.alias);
    }

    if (Object.keys(properties).length > 0) {
      schemaObject = {
        type: 'object',
        required: Array.from(new Set(required)),
        properties,
      } satisfies OpenAPIV3.SchemaObject;
    }
  }

  if (schemaObject) {
    normalizeSchemaForGenerationDeep(schemaObject);
  }

  const finalSchema = schemaObject
    ? Object.assign(buildRefContext(schemaObject, store?.parsed), schemaObject)
    : void 0;

  let code = '';
  let enumsCode: string | undefined;

  if (finalSchema) {
    const targetSchema = prepareTargetSchema(finalSchema, apiConfig, 'req');
    try {
      code = generate(targetSchema as never, {
        name: 'Req',
      });
      if (hasNonJsonBodySentinel) {
        code = replaceNonJsonSentinels(code);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      log.error('生成请求参数类型失败，请检查 %o', {
        summary: operationObject.summary,
        message,
        operationId: operationObject.operationId,
      });
    }

    if (isTargetOptionEnabled(apiConfig?.enableEnums, 'req')) {
      const enumTarget =
        hasNonJsonBodySentinel &&
        'properties' in targetSchema &&
        targetSchema.properties
          ? {
              ...targetSchema,
              properties: Object.fromEntries(
                Object.entries(targetSchema.properties).filter(
                  ([k]) => k !== 'body',
                ),
              ),
            }
          : targetSchema;
      enumsCode = compileEnumObject(enumTarget);
    }
  }

  return {
    code: code || 'export type Req = any;',
    enumsCode,
  };
}

export async function compileResponseParams(
  operationObject: OpenAPIV3.OperationObject,
  apiConfig: ApiConfig,
) {
  const store = asyncLocalStorage.getStore();

  function resolveSchema(
    arg:
      | OpenAPIV3.ReferenceObject
      | OpenAPIV3.ResponseObject
      | OpenAPIV3.MediaTypeObject
      | OpenAPIV3.SchemaObject
      | undefined,
  ): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined {
    if (!arg) return;

    if ('content' in arg) {
      return resolveSchema(pickJsonMedia(arg.content)?.schema);
    }
    // 兼容 swagger v2 的 response.schema
    if ('schema' in arg && arg.schema) {
      return resolveSchema(arg.schema as never);
    }

    if ('$ref' in arg) {
      return resolveSchema(store?.parser.$refs.get(arg.$ref) as never);
    }
    const schema = apiConfig.responseSchemaTransformer!(arg as never) as
      | OpenAPIV3.ReferenceObject
      | OpenAPIV3.SchemaObject;
    // Transform response alternatives, not nested payload schemas. If the
    // transformer extracted data (or replaced the schema), its result is final.
    if (
      schema === arg &&
      !('$ref' in schema) &&
      (schema.oneOf || schema.anyOf)
    ) {
      return {
        ...schema,
        ...(schema.oneOf && {
          oneOf: schema.oneOf.map((branch) => resolveSchema(branch)!),
        }),
        ...(schema.anyOf && {
          anyOf: schema.anyOf.map((branch) => resolveSchema(branch)!),
        }),
      };
    }
    return schema;
  }
  const schemaObject = resolveSchema(
    pickSuccessResponse(operationObject.responses),
  );
  if (schemaObject) {
    normalizeSchemaForGenerationDeep(schemaObject);
  }

  const finalSchema = schemaObject
    ? Object.assign(buildRefContext(schemaObject, store?.parsed), schemaObject)
    : void 0;

  let code = '';
  let enumsCode: string | undefined;

  if (finalSchema) {
    const targetSchema = prepareTargetSchema(finalSchema, apiConfig, 'res');
    try {
      code = generate(targetSchema as never, {
        name: 'Res',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      log.error('转换响应参数类型失败，请检查 %o', {
        summary: operationObject.summary,
        error: message,
        operationId: operationObject.operationId,
      });
    }

    if (isTargetOptionEnabled(apiConfig.enableEnums, 'res')) {
      enumsCode = compileEnumObject(targetSchema);
    }
  } else {
    log.error('responseSchemaTransformer 返回值为空，请检查');
  }

  return {
    code: code || 'export type Res = any;',
    enumsCode,
  };
}
