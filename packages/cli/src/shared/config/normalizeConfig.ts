import path from "path";
import { ApiConfig, Config } from "./types";
export function normalizeConfig(config: Config): Config {
  config.cwd ??= process.cwd();
  config.cacheDir ??= path.join(config.cwd, "node_modules/.cache/dune-cli");

  //#region api 配置标准化
  config.api ??= [];
  config.api = config.api.map(apiConfigNormalizer);
  //#endregion
  return config;
}
export function apiConfigNormalizer(item: ApiConfig) {
  item.output ??= "./src/apis";
  item.RequestBuilderImportPath ??= `import { RequestBuilder } from '@dune2/tools/rq';`;
  item.FieldsMapImportPath ??= `import { type FieldsMap, fieldsMap } from '@dune2/tools/factory/fieldsMap';`;
  item.enableTs ??= true;
  item.enabled ??= true;
  item.format ??= true;
  item.responseSchemaTransformer ??= (schema) =>
    schema.properties?.data ?? schema;
  return item;
}
