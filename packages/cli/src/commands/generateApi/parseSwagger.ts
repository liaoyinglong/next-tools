import SwaggerParser from '@apidevtools/swagger-parser';
import { merge } from 'es-toolkit';
import type { OpenAPIV3 } from 'openapi-types';
import { createLogger } from '../../shared';
import type { ApiConfig } from '../../shared/config';
import type { ParsedDocument, SwaggerParseState } from './context';
import { normalizeSchemaForGenerationDeep } from './schema';

const log = createLogger('generateApi');

const DEFAULT_FETCH_TIMEOUT = 30_000;

function getHttpTimeout(options: SwaggerParser.Options) {
  const http = options.resolve?.http;
  if (http && typeof http === 'object' && 'timeout' in http) {
    return typeof http.timeout === 'number'
      ? http.timeout
      : DEFAULT_FETCH_TIMEOUT;
  }
  return DEFAULT_FETCH_TIMEOUT;
}

function isParsedDocument(value: unknown): value is ParsedDocument {
  return (
    !!value &&
    typeof value === 'object' &&
    ('paths' in value || 'openapi' in value || 'swagger' in value)
  );
}

async function fetchRemoteDocument(
  url: string,
  options: SwaggerParser.Options,
): Promise<ParsedDocument> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(getHttpTimeout(options)),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (!isParsedDocument(json)) {
    throw new Error(`Remote OpenAPI document is invalid: ${url}`);
  }
  return json;
}

/**
 * 解析（远程或本地）swagger 文档。
 * swagger-parser 内置的 HTTP resolver 对远程 URL 不可靠，
 * 远程文档由我们自行 fetch 后把对象交给 bundle。
 */
export async function parseSwagger(
  apiConfig: ApiConfig,
): Promise<SwaggerParseState> {
  log.info('开始解析 %s', apiConfig.swaggerJSONPath);
  const startedAt = Date.now();

  const dereferenceConfig: SwaggerParser.Options = merge(
    {
      resolve: {
        http: {
          timeout: DEFAULT_FETCH_TIMEOUT,
        },
      },
    } satisfies SwaggerParser.Options,
    apiConfig.dereferenceSwaggerConfig || {},
  );
  const parser = new SwaggerParser();

  const isRemoteUrl = /^https?:\/\//.test(apiConfig.swaggerJSONPath);
  const bundleInput = isRemoteUrl
    ? await fetchRemoteDocument(apiConfig.swaggerJSONPath, dereferenceConfig)
    : apiConfig.swaggerJSONPath;
  const parsed = await parser.bundle(bundleInput, dereferenceConfig);
  // default 值经常和 type 不一致（例如 integer + ""），
  // 生成前统一移除，避免输出错误的类型或文档。
  normalizeSchemaForGenerationDeep(parsed);

  log.info(
    '解析 %s 成功，耗时 %dms',
    apiConfig.swaggerJSONPath,
    Date.now() - startedAt,
  );
  return {
    parsed: parsed as OpenAPIV3.Document,
    parser,
  };
}
