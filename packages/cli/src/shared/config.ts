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

export interface ApiConfig {
  /**
   * swagger JSON 的路径  可以是 本地 可以是远程
   */
  swaggerJSONPath: string;
  /**
   * 用在生成代码里快捷连接跳转到 swagger ui
   * 必须携带 urls.primaryName 参数
   * @example http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API
   */
  swaggerUiUrl?: string;
  /**
   * 输出的文件夹路径
   * @default "./src/apis"
   */
  output?: string;
  /**
   * 配置`requestFn` 方法引入的路径，生成的代码里会用到，生成代码如下
   * 引入的名称必须是`requestFn`
   * ```ts
   * // 需要命名为 requestFn
   * import requestFn from '@/utils/request'
   * import { foo as requestFn } from '@/utils/request'
   * ```
   * @default `import requestFn from '@/utils/request'`
   */
  requestFnImportPath?: string;
}

export interface Config {
  i18n?: I18nConfig[];
  api?: ApiConfig[];
  /**
   * 默认是 命令运行的目录，一般是项目根目录
   * @internal
   */
  cwd?: string;
}
export function defineConfig<T = Config>(c: T) {
  return c;
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
    return item;
  });
  //#endregion

  //#region api 配置标准化
  config.api ??= [];
  config.api = config.api.map((item) => {
    item.output ??= "./src/apis";
    item.requestFnImportPath ??= `import requestFn from '@/utils/request';`;
    return item;
  });
  //#endregion

  return config;
}
