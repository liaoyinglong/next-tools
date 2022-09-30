import JoyCon from "joycon";
import { resolveSheetId } from "./resolveSheetId";

const joycon = new JoyCon();

export interface I18nConfig {
  // 语言文件存放目录，默认为项目根目录的 "./src/i18n"
  i18nDir?: string;
  // 语言文件名，默认为 "{locale}.i18n.json"，其中 {locale} 会被替换为 locales 中的语言
  i18nFileName?: string;
  // 默认语言，默认为 "zh"，影响到提出出来的文案的默认值
  defaultLocale?: string;
  /**
   * 可以是 id 或者 url，如果是 url 则会自动解析出 id
   * id:  1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk
   * url: https://docs.google.com/spreadsheets/d/1C9-Dol3oO20W9_FhiVlxNsDhOaaejJIgAZYRkonGmfk/edit#gid=1740568548
   */
  sheetId?: string;
  // google sheets 工作表名称
  sheetRange?: string;
  /**
   * 对应 语言、i18nKey 所在的列标识符 如(A,B,C...)
   * 传入时将忽略默认的配置
   * @default  {key: "B", zh: "C", en: "D", in: "E",}
   */
  position?: {
    key: string;
    [key: string]: string;
  };

  /**
   * 从 Google Sheets 哪一行开始解析
   * 默认从第2行开始，模板文件第一行是表头
   * @default 2
   */
  parseStartIndex?: number;

  /**
   * 默认是 命令运行的目录，一般是项目根目录
   * @internal
   */
  cwd?: string;
  /**
   * 支持的语言列表，从 position 中解析出来
   * @internal
   */
  locales?: string[];

  /**
   * 翻译key的排序
   * @internal
   */
  keySorter?: (a: string, b: string) => number;
}

export interface Config {
  i18n?: I18nConfig[];
  /**
   * 默认是 命令运行的目录，一般是项目根目录
   * @internal
   */
  cwd?: string;
}
export const configName = "dune.config.js";

export async function getConfig(): Promise<Config> {
  const res = await joycon.load([configName]);

  const defaultI18nConfig: I18nConfig = {
    i18nDir: "./src/i18n",
    i18nFileName: "{locale}.i18n.json",
    position: { key: "B", zh: "C", en: "D", in: "E" },
    parseStartIndex: 2,
  };

  let config = (res.data ?? {}) as Config;
  config.cwd ??= process.cwd();

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
    return item;
  });

  return config;
}
