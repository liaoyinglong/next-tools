import JoyCon from "joycon";
import { resolveSheetId } from "./resolveSheetId";

const joycon = new JoyCon();

export interface Config {
  // 语言文件存放目录，默认为项目根目录的 "./i18n"
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
}
export interface InternalConfig extends Config {
  // 默认是 命令运行的目录，一般是项目根目录
  cwd?: string;
  // 支持的语言列表，从 position 中解析出来
  locales?: string[];
}

export function defineConfig(config: Config | Config[]) {
  return config;
}

export const configName = "dune.config.js";

export async function getConfig(): Promise<InternalConfig[]> {
  const res = await joycon.load([configName]);

  const defaultConfig = {
    i18nDir: "./i18n",
    i18nFileName: "{locale}.i18n.json",
    cwd: process.cwd(),
    position: {
      key: "B",
      zh: "C",
      en: "D",
      in: "E",
    },
    parseStartIndex: 2,
  };

  if (res.data) {
    const config: InternalConfig[] = Array.isArray(res.data)
      ? res.data
      : [res.data];
    return config.map((item) => {
      item = Object.assign({}, defaultConfig, item);
      item.locales = Object.keys(item.position).filter(
        (item) => item !== "key"
      );

      item.sheetId = resolveSheetId(item.sheetId);

      return item;
    });
  }

  return [defaultConfig];
}
