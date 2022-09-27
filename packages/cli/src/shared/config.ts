import JoyCon from "joycon";

const joycon = new JoyCon();

export interface Config {
  // 支持的语言列表，默认为 ["zh", "en", "in"]，数组第一项为默认语言
  locales?: string[];
  // 语言文件存放目录，默认为项目根目录的 "./i18n"
  i18nDir?: string;
  // 语言文件名，默认为 "{locale}.i18n.json"，其中 {locale} 会被替换为 locales 中的语言
  i18nFileName?: string;
  // 默认是 命令运行的目录，一般是项目根目录
  cwd?: string;
}
export interface InternalConfig extends Config {}

export function defineConfig(config: Config) {
  return config;
}

export const configName = "dune.config.js";

export async function getConfig(): Promise<InternalConfig> {
  const res = await joycon.load([configName]);
  const config = (res.data ?? {}) as InternalConfig;
  config.cwd ??= process.cwd();
  config.locales ??= ["zh", "en", "in"];
  config.i18nDir ??= "./i18n";
  config.i18nFileName ??= "{locale}.i18n.json";
  return config;
}
