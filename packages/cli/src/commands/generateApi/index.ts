import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'node:fs/promises';
import * as os from 'os';
import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';
import { camelCase, isPlainObject, merge } from 'es-toolkit';
import { compile } from 'json-schema-to-typescript';
import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import pMap from 'p-map';
import { createLogger } from '../../shared';
import { ApiConfig, getConfig } from '../../shared/config';
import { promptApiConfigEnable } from '../../shared/promptConfigEnable';

const log = createLogger('generateApi');

type ParsedDocument = OpenAPIV2.Document | OpenAPIV3.Document;

export const asyncLocalStorage = new AsyncLocalStorage<{
  parsed: ParsedDocument;
  parser: SwaggerParser;
}>();

function getCompileSchemaContext(parsed: ParsedDocument | undefined) {
  if (!parsed) return {};
  const context: Record<string, unknown> = {};
  if ('components' in parsed && parsed.components) {
    context.components = parsed.components;
  }
  if ('definitions' in parsed && parsed.definitions) {
    context.definitions = parsed.definitions;
  }
  return context;
}

function stripDefaultKeywordDeep(value: unknown) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => stripDefaultKeywordDeep(item));
    return;
  }

  const record = value as Record<string, unknown>;
  if ('default' in record) {
    delete record.default;
  }

  Object.values(record).forEach((item) => stripDefaultKeywordDeep(item));
}

export async function generateApi() {
  const config = await getConfig();
  const selectedConfigs = await promptApiConfigEnable(config.api);
  const apiConfigs = selectedConfigs.filter((apiConfig) => {
    if (!apiConfig.output) {
      log.error('配置 %s 缺少 output，已跳过', apiConfig.swaggerJSONPath);
      return false;
    }
    return true;
  });
  const skippedConfigCount = selectedConfigs.length - apiConfigs.length;

  if (skippedConfigCount > 0) {
    log.info('由于缺少 output，跳过 %d 个配置', skippedConfigCount);
  }

  if (!apiConfigs.length) {
    log.info('没有需要生成的 API 配置，生成流程结束');
    return;
  }

  log.info('本次将生成 %d 个 API 配置', apiConfigs.length);

  let totalSuccessCount = 0;
  let totalFailedCount = 0;
  const startedAt = Date.now();

  const preparedConfigs: ApiConfig[] = [];

  for (const apiConfig of apiConfigs) {
    log.info('开始初始化输出目录 %s', apiConfig.output);
    const prepareStartedAt = Date.now();
    try {
      await fs.rm(apiConfig.output!, { recursive: true, force: true });
      await fs.mkdir(apiConfig.output!, { recursive: true });
      preparedConfigs.push(apiConfig);
      log.info(
        '输出目录 %s 初始化完成，耗时 %dms',
        apiConfig.output,
        Date.now() - prepareStartedAt,
      );
    } catch (error) {
      totalFailedCount++;
      const message = error instanceof Error ? error.message : String(error);
      log.error('初始化输出目录 %s 失败：%s', apiConfig.output, message);
    }
  }

  if (!preparedConfigs.length) {
    log.error('所有配置都初始化失败，生成流程结束');
    log.info(
      'generateApi Done，成功 %d 个，失败 %d 个，总耗时 %dms',
      totalSuccessCount,
      totalFailedCount,
      Date.now() - startedAt,
    );
    return;
  }

  for (const apiConfig of preparedConfigs) {
    log.info('开始解析 %s', apiConfig.swaggerJSONPath);
    const dereferenceConfig = merge(
      {
        resolve: {
          http: {
            timeout: 30 * 1000,
          },
        },
      },
      apiConfig.dereferenceSwaggerConfig || {},
    );
    const parser = new SwaggerParser();
    const bundleStartedAt = Date.now();

    let parsed: unknown;
    try {
      // swagger-parser's built-in HTTP resolver fails on remote URLs,
      // so we fetch the JSON ourselves and pass the parsed object instead.
      const isRemoteUrl = /^https?:\/\//.test(apiConfig.swaggerJSONPath);
      const bundleInput = isRemoteUrl
        ? await fetch(apiConfig.swaggerJSONPath).then((res) => {
            if (!res.ok)
              throw new Error(`HTTP ${res.status} ${res.statusText}`);
            return res.json();
          })
        : apiConfig.swaggerJSONPath;
      parsed = await parser.bundle(bundleInput, dereferenceConfig);
      // default 值经常和 type 不一致（例如 integer + ""），
      // 会被 json-schema-to-typescript 推断成交叉类型（number & string）。
      // 生成前统一移除 default，避免污染类型。
      stripDefaultKeywordDeep(parsed);
      log.info(
        '解析 %s 成功，耗时 %dms',
        apiConfig.swaggerJSONPath,
        Date.now() - bundleStartedAt,
      );
    } catch (error) {
      totalFailedCount++;
      const message = error instanceof Error ? error.message : String(error);
      log.error('解析 %s 失败：%s', apiConfig.swaggerJSONPath, message);
      continue;
    }

    const state = {
      // only support v3
      parsed: parsed as OpenAPIV3.Document,
      parser,
    };

    let generatedCount = 0;
    let skippedCount = 0;
    const pathEntries = Object.entries(
      (parsed as OpenAPIV3.Document).paths ?? {},
    );
    if (!pathEntries.length) {
      log.error('%s 中没有可用的 paths，已跳过', apiConfig.swaggerJSONPath);
      totalFailedCount++;
      continue;
    }

    await asyncLocalStorage.run(state, async () => {
      await pMap(pathEntries, async ([url, pathItemObject]) => {
        if (!pathItemObject) {
          log.error('路径 %s 未定义 pathItemObject，已跳过', url);
          skippedCount++;
          return;
        }

        log.info('开始生成 %s', url);
        let generatedForUrl = 0;
        await pMap(
          ['get', 'put', 'post', 'delete', 'patch'],
          async (method) => {
            const operationObject = pathItemObject[method];
            if (!operationObject) {
              return;
            }

            try {
              const code = await generateApiRequestCode({
                url: url,
                method: method,
                operationObject: operationObject,
                apiConfig,
              });
              const outputPath = path
                .join(
                  apiConfig.output!,
                  url,
                  apiConfig.enableTs ? `${method}.ts` : `${method}.js`,
                )
                .replace(/:/g, '_');
              await fs.mkdir(path.dirname(outputPath), {
                recursive: true,
              });
              await fs.writeFile(outputPath, code);
              generatedCount++;
              generatedForUrl++;
            } catch (error) {
              skippedCount++;
              const message =
                error instanceof Error ? error.message : String(error);
              log.error(
                '%s %s 生成失败：%s',
                method.toUpperCase(),
                url,
                message,
              );
            }
          },
        );
        if (generatedForUrl === 0) {
          log.info('路径 %s 未生成任何方法', url);
        }
      });
    });

    if (!generatedCount) {
      log.error('%s 未生成任何请求，已标记失败', apiConfig.swaggerJSONPath);
      totalFailedCount++;
      continue;
    }

    if (apiConfig.codeFormatterCmd) {
      const { exec } = await import('child_process');
      await new Promise<void>((resolve) => {
        exec(
          `${apiConfig.codeFormatterCmd} "${apiConfig.output!}"`,
          (error) => {
            if (error) {
              skippedCount++;
              log.error(`Code formatting failed: ${error.message}`);
            } else {
              log.info(`Code formatting success`);
            }
            resolve();
          },
        );
      });
    }

    log.info(
      '%s 生成完成，共生成 %d 个请求，跳过 %d 个',
      apiConfig.swaggerJSONPath,
      generatedCount,
      skippedCount,
    );
    totalSuccessCount++;
  }

  log.info(
    'generateApi Done，成功 %d 个，失败 %d 个，总耗时 %dms',
    totalSuccessCount,
    totalFailedCount,
    Date.now() - startedAt,
  );
}

/**
 * 根据请求方法，生成请求代码
 */
export async function generateApiRequestCode(options: {
  url: string;
  method: string;
  operationObject: OpenAPIV3.OperationObject;
  apiConfig: ApiConfig;
}): Promise<string> {
  const { method, operationObject, apiConfig } = options;

  const url = (() => {
    if (typeof apiConfig.urlTransformer === 'string') {
      return `${apiConfig.urlTransformer}${options.url}`;
    }
    if (typeof apiConfig.urlTransformer === 'function') {
      return apiConfig.urlTransformer(options.url);
    }
    return options.url;
  })();

  const seeUrl = apiConfig.swaggerUiUrl
    ? `${apiConfig.swaggerUiUrl}#/${encodeURIComponent(
        `${operationObject.tags?.join('/') ?? ''}/${
          operationObject.operationId
        }`,
      )}`
    : '';

  // 生成的请求构造器的名称，需要使用原始 url
  let requestBuilderName = camelCase(`${options.url}_${method}_api`);

  // 判断是否有效的 js 变量
  if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(requestBuilderName)) {
    // 不是有效的 js 变量，使用 _ + 数字
    requestBuilderName = `_${requestBuilderName}`;
  }

  //#region url 上参数 例如 /api/v1/users/{userId}
  const urlPathParams = getUrlPathParams(
    (operationObject.parameters as never) ?? [],
  );
  const urlPathParamsCode = urlPathParams.length
    ? `urlPathParams: ${JSON.stringify(urlPathParams)},`
    : '';
  //#endregion

  let code: string[] = [
    '// do not edit this file manually, it will be overwritten by @dune2/cli',
    apiConfig.RequestBuilderImportPath!,
    apiConfig.queryClientImportPath!,

    '/**',
    `  * ${operationObject.summary}`,
    `  * @tags ${operationObject.tags?.join(',')}`,
    seeUrl && `  * @see ${seeUrl}`,
    `  */`,
  ].filter(Boolean);

  // builder 代码
  let builderCode = `\
export const ${requestBuilderName} = new RequestBuilder({
  url: '${url}',
  method: '${method}',
  ${urlPathParamsCode}
  ${apiConfig.queryClientImportPath ? 'queryClient,' : ''}
});`
    // 移除空行
    .replace(/,\n\s*}/, ',' + os.EOL + '}');
  if (apiConfig.enableTs) {
    builderCode = builderCode.replace(
      'new RequestBuilder(',
      `new RequestBuilder<${requestBuilderName}.Req, ${requestBuilderName}.Res>(`,
    );
  }
  code.push(builderCode);

  if (apiConfig.enableTs) {
    const [requestParamsTypeCode, responseParamsTypeCode] = await Promise.all([
      // 请求参数类型
      compileRequestParams(operationObject),
      // 响应参数类型
      compileResponseParams(operationObject, apiConfig),
    ]);

    code.push(`
export namespace ${requestBuilderName} {
 ${requestParamsTypeCode.code}
 
 ${responseParamsTypeCode}
};`);
  }

  return code.join(os.EOL);
}

function getUrlPathParams(parameters: OpenAPIV3.ParameterObject[]) {
  return parameters
    .filter((item) => item.in === 'path')
    .map((item) => item.name);
}

/**
 * 这个方法还不完善，只能处理简单的请求参数
 */
async function compileRequestParams(
  operationObject: OpenAPIV3.OperationObject,
) {
  const store = asyncLocalStorage.getStore();
  const requestBodySchemaOrRef = (() => {
    if (!operationObject.requestBody) {
      return;
    }
    if ('$ref' in operationObject.requestBody) {
      return operationObject.requestBody;
    }
    return operationObject.requestBody.content['application/json'].schema;
  })();

  const parameterSchema = (() => {
    if (!operationObject.parameters) {
      return;
    }
    const extraProperties = {};
    const parameters: OpenAPIV3.ParameterObject[] = [];
    (operationObject.parameters as OpenAPIV3.ParameterObject[]).forEach(
      (item) => {
        if (!['query', 'path'].includes(item.in)) {
          return;
        }
        if (
          item.schema &&
          'type' in item.schema &&
          item.schema.type === 'object'
        ) {
          // swagger get 请求上 有些参数是 object 类型 应该拍平
          Object.assign(
            extraProperties,
            (item.schema as OpenAPIV3.SchemaObject).properties || {},
          );
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
    requestBodySchema && parameterSchema
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
            ...(requestBodySchema.properties || {}),
            ...(parameterSchema.properties || {}),
          },
        } satisfies OpenAPIV3.SchemaObject)
      : requestBodySchema || parameterSchema;

  if (schemaObject) {
    stripDefaultKeywordDeep(schemaObject);
  }

  const finalSchema = schemaObject
    ? Object.assign(getCompileSchemaContext(store?.parsed), schemaObject)
    : void 0;

  let code = '';
  if (finalSchema) {
    try {
      code = await compile(finalSchema as never, 'Req', {
        bannerComment: '',
        ignoreMinAndMaxItems: !!1,
        additionalProperties: false,
        unknownAny: false,
        // format: false,
      });
    } catch (e) {
      log.error('生成请求参数类型失败，请检查 %o', {
        summary: operationObject.summary,
        message: e.message,
        operationId: operationObject.operationId,
      });
    }
  }

  return {
    code: code || 'export type Req = any;',
  };
}

async function compileResponseParams(
  operationObject: OpenAPIV3.OperationObject,
  apiConfig: ApiConfig,
) {
  const store = asyncLocalStorage.getStore();

  function resolveSchema(
    arg:
      | OpenAPIV3.ReferenceObject
      | OpenAPIV3.ResponseObject
      | OpenAPIV3.MediaTypeObject
      | undefined,
  ) {
    if (!arg) return;

    if ('content' in arg) {
      const temp = arg.content?.['application/json'] || arg.content?.['*/*'];
      return resolveSchema(temp?.schema);
    }
    // 兼容 swagger v2 的 response.schema
    if ('schema' in arg && arg.schema) {
      return resolveSchema(arg.schema as never);
    }

    let schema = apiConfig.responseSchemaTransformer!(arg as never) as
      | OpenAPIV3.ReferenceObject
      | OpenAPIV3.SchemaObject;
    if ('$ref' in schema) {
      return resolveSchema(store?.parser.$refs.get(schema.$ref) as never);
    }
    return schema;
  }
  const schemaObject = resolveSchema(operationObject.responses['200']);
  if (schemaObject) {
    stripDefaultKeywordDeep(schemaObject);
  }

  const finalSchema = schemaObject
    ? Object.assign(getCompileSchemaContext(store?.parsed), schemaObject)
    : void 0;

  let code = '';
  if (finalSchema) {
    try {
      code = await compile(finalSchema, 'Res', {
        bannerComment: '',
        ignoreMinAndMaxItems: !!1,
        additionalProperties: false,
        unknownAny: false,
        // format: false,
      });
    } catch (e) {
      log.error('转换响应参数类型失败，请检查 %o', {
        summary: operationObject.summary,
        error: e.message,
        operationId: operationObject.operationId,
      });
    }
  } else {
    log.error('responseSchemaTransformer 返回值为空，请检查');
  }

  return code ? code : 'export type Res = any;';
}
