import JoyCon from "joycon";
import { resolveSheetId } from "./resolveSheetId";

const joycon = new JoyCon();

export interface Config {
  // 支持的语言列表，默认为 ["zh", "en", "in"]，数组第一项为默认语言
  locales?: string[];
  // 语言文件存放目录，默认为项目根目录的 "./i18n"
  i18nDir?: string;
  // 语言文件名，默认为 "{locale}.i18n.json"，其中 {locale} 会被替换为 locales 中的语言
  i18nFileName?: string;

  /**
   * 可以是 id 或者 url，如果是 url 则会自动解析出 id
   * id:  1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk
   * url: https://docs.google.com/spreadsheets/d/1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk/edit#gid=1740568548
   */
  sheetId?: string;
  // google sheets 工作表名称
  sheetRange?: string;
}
export interface InternalConfig extends Config {
  // 默认是 命令运行的目录，一般是项目根目录
  cwd?: string;
}

export function defineConfig(config: Config | Config[]) {
  return config;
}

export const configName = "dune.config.js";

export async function getConfig(): Promise<InternalConfig[]> {
  const res = await joycon.load([configName]);

  const defaultConfig = {
    locales: ["zh", "en", "in"],
    i18nDir: "./i18n",
    i18nFileName: "{locale}.i18n.json",
    cwd: process.cwd(),
  };

  if (res.data) {
    const config: InternalConfig[] = Array.isArray(res.data)
      ? res.data
      : [res.data];
    return config.map((item) => {
      item = Object.assign({}, defaultConfig, item);

      item.sheetId = resolveSheetId(item.sheetId);

      return item;
    });
  }

  return [defaultConfig];
}
