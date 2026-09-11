import { ApiConfig, Config } from './types';
export function normalizeConfig(config: Config): Config {
  const next: Config = { ...config };

  //#region api 配置标准化
  next.api = (next.api ?? []).map(apiConfigNormalizer);
  //#endregion
  return next;
}
export function apiConfigNormalizer(item: ApiConfig): ApiConfig {
  const next: ApiConfig = { ...item };
  next.output ??= './src/apis';
  next.RequestBuilderImportPath ??= `import { RequestBuilder } from '@dune2/tools/rq';`;
  next.enableTs ??= true;
  next.enabled ??= true;
  next.codeFormatterCmd ??= 'oxfmt';
  next.responseSchemaTransformer ??= (schema) =>
    schema.properties?.data ?? schema;
  return next;
}
