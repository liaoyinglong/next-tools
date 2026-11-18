import { generate } from '@fumari/json-schema-ts';
import { isPlainObject } from 'es-toolkit';
import type { OpenAPIV3 } from 'openapi-types';
import { createLogger } from '../../shared';
import type { ApiConfig } from '../../shared/config';
import { asyncLocalStorage } from './context';
import {
  buildRefContext,
  cloneSchemaDeep,
  getRequestBodySchema,
  isCompatibleNumberStringEnabled,
  normalizeSchemaForGenerationDeep,
  pickJsonMedia,
  pickSuccessResponse,
  widenNumberToStringDeep,
} from './schema';
import { compileZodSchema } from './zodCompiler';

const log = createLogger('generateApi');

/**
 * 这个方法还不完善，只能处理简单的请求参数
 */
export async function compileRequestParams(
  operationObject: OpenAPIV3.OperationObject,
  apiConfig?: ApiConfig,
) {
  const store = asyncLocalStorage.getStore();
  const requestBodySchemaOrRef = getRequestBodySchema(
    operationObject.requestBody,
  );

  const parameterSchema = (() => {
    if (!operationObject.parameters) {
      return;
    }
    const extraProperties = {};
    const extraRequired: string[] = [];
    const parameters: OpenAPIV3.ParameterObject[] = [];
    (operationObject.parameters as OpenAPIV3.ParameterObject[]).forEach(
      (item) => {
        if (!['query', 'path'].includes(item.in)) {
          return;
        }

        const schema =
          item.schema && '$ref' in item.schema
            ? (store?.parser.$refs.get(
                item.schema.$ref,
              ) as OpenAPIV3.SchemaObject)
            : item.schema;
        if (schema && 'type' in schema && schema.type === 'object') {
          // swagger get 请求上有些参数是 object 类型（也可能通过 $ref 引用），应该拍平
          Object.assign(extraProperties, schema.properties || {});
          extraRequired.push(...(schema.required || []));
        } else {
          parameters.push(item);
        }
      },
    );
    // 必填参数中忽略 分页相关的参数
    const required = parameters
      .filter(
        (p) => p.required && !['pageNum', 'pageSize', 'count'].includes(p.name),
      )
      .map((p) => p.name);
    required.push(...extraRequired);
    const properties = Object.fromEntries(
      parameters
        // 后端 swagger 可能出现没有 schema 的情况，这里过滤掉
        .filter((p) => !!p.schema)
        .map((p) => {
          const schema = p.schema;
          return [
            p.name,
            {
              ...schema,
              description: p.description,
              // enum: schema.enum ?? [],
            },
          ];
        }),
    );
    return {
      required,
      type: 'object',
      properties: { ...properties, ...extraProperties },
    } satisfies OpenAPIV3.SchemaObject;
  })();

  const requestBodySchema = isPlainObject(requestBodySchemaOrRef)
    ? '$ref' in requestBodySchemaOrRef
      ? (store?.parser.$refs.get(
          requestBodySchemaOrRef.$ref,
        ) as OpenAPIV3.SchemaObject)
      : requestBodySchemaOrRef
    : void 0;

  const schemaObject =
    requestBodySchema &&
    parameterSchema &&
    Object.keys(parameterSchema.properties).length > 0
      ? ({
          ...requestBodySchema,
          type: 'object',
          required: [
            ...new Set([
              ...(requestBodySchema.required || []),
              ...(parameterSchema.required || []),
            ]),
          ],
          properties: {
            ...requestBodySchema.properties,
            ...parameterSchema.properties,
          },
        } satisfies OpenAPIV3.SchemaObject)
      : requestBodySchema || parameterSchema;

  if (schemaObject) {
    normalizeSchemaForGenerationDeep(schemaObject);
  }

  const finalSchema = schemaObject
    ? Object.assign(buildRefContext(schemaObject, store?.parsed), schemaObject)
    : void 0;

  let code = '';
  let zodCode: string | undefined;
  let zodHelpers: string[] = [];
  const compatReqNumber = isCompatibleNumberStringEnabled(
    apiConfig?.compatibleNumberString,
    'req',
  );

  if (finalSchema) {
    try {
      const tsSchema = compatReqNumber
        ? (() => {
            const cloned = cloneSchemaDeep(finalSchema);
            widenNumberToStringDeep(cloned);
            return cloned;
          })()
        : finalSchema;

      code = generate(tsSchema as never, {
        name: 'Req',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      log.error('生成请求参数类型失败，请检查 %o', {
        summary: operationObject.summary,
        message,
        operationId: operationObject.operationId,
      });
    }

    if (apiConfig?.enableZod) {
      const compiledZod = compileZodSchema(finalSchema, {
        compatibleNumberString: compatReqNumber,
      });
      zodCode = compiledZod?.code;
      zodHelpers = compiledZod?.helpers ?? [];
    }
  }

  return {
    code: code || 'export type Req = any;',
    zodCode,
    zodHelpers,
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
  const compatResNumber = isCompatibleNumberStringEnabled(
    apiConfig.compatibleNumberString,
    'res',
  );

  if (finalSchema) {
    try {
      const tsSchema = compatResNumber
        ? (() => {
            const cloned = cloneSchemaDeep(finalSchema);
            widenNumberToStringDeep(cloned);
            return cloned;
          })()
        : finalSchema;

      code = generate(tsSchema as never, {
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
  } else {
    log.error('responseSchemaTransformer 返回值为空，请检查');
  }

  return code ? code : 'export type Res = any;';
}
