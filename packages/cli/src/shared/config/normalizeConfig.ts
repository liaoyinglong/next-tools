import { ApiConfig, Config, I18nConfig } from "./types";
import { resolveSheetId } from "../resolveSheetId";
import path from "path";
export function normalizeConfig(config: Config): Config {
  const defaultI18nConfig: I18nConfig = {
    i18nDir: "./src/i18n",
    i18nFileName: "{locale}.i18n.json",
    position: { key: "B", zh: "C", en: "D", in: "E" },
    parseStartIndex: 2,
  };
  config.cwd ??= process.cwd();
  config.cacheDir ??= path.join(config.cwd, "node_modules/.cache/dune-cli");

  //#region i18n 配置标准化
  if (!config.i18n || !config.i18n?.length) {
    config.i18n = [defaultI18nConfig];
  }

  // 格式化 i18n 配置
  config.i18n = config.i18n.map((item) => {
    item = Object.assign({}, defaultI18nConfig, item);
    item.cwd ??= config.cwd;
    item.locales = Object.keys(item.position!).filter((item) => item !== "key");
    item.sheetId = resolveSheetId(item.sheetId);
    item.keySorter = (a, b) => {
      return a.localeCompare(b);
    };
    item.enabled ??= true;
    return item;
  });
  //#endregion

  //#region api 配置标准化
  config.api ??= [];
  config.api = config.api.map(apiConfigNormalizer);
  //#endregion
  return config;
}
export function apiConfigNormalizer(item: ApiConfig) {
  item.output ??= "./src/apis";
  // 没有配置 urlTransformer 时，给 requestFnImportPath 赋默认值
  // 优先使用 urlTransformer
  if (!item.urlTransformer) {
    item.requestFnImportPath ??= `import requestFn from '@/utils/request';`;
  }
  item.RequestBuilderImportPath ??= `import { RequestBuilder } from '@dune2/tools';`;
  item.enableTs ??= true;
  item.enabled ??= true;
  item.format ??= true;
  item.responseSchemaTransformer ??= (schema) =>
    schema.properties?.data ?? schema;
  return item;
}
