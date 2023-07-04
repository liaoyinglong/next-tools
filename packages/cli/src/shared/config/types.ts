import { OpenAPIV3 } from "openapi-types";

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
  jsonSorter?: <T extends Record<string, any>>(obj: T) => T;
  /**
   * 是否启用
   * @internal
   */
  enabled?: boolean;

  /**
   * 包括的文件
   * glob 语法
   */
  include?: string[];
  /**
   * 是否禁用提取功能，某些项是不需要提取的，只需要同不Google sheet
   * @default false
   */
  disableExtract?: boolean;

  /**
   * 翻译文案支持 namespace
   * key 为 namespace
   * value 为 对应的文件夹路径
   * 使用场景：根据不同的业务模块，将翻译的key添加不同的前缀，并修改对应代码
   */
  namespace?: Record<string, string | string[]>;
  /**
   * namespace 分隔符
   * @default "."
   */
  namespaceSeparator?: string;
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
   * 导入的变量必须是命名为`requestFn`
   * ```ts
   * // 需要命名为 requestFn
   * import requestFn from '@/utils/request'
   * import { foo as requestFn } from '@/utils/request'
   * ```
   * @default `import requestFn from '@/utils/request'`
   * @deprecated 优先使用 `urlTransformer`
   */
  requestFnImportPath?: string;
  /**
   * 配置`queryClient` 路径，导入的变量必须是命名为`queryClient`
   * @example `import queryClient from '@/utils/request'`
   * @example `import { queryClient } from '@/utils/request'`
   * @example `import { xxClient as queryClient } from '@/utils/request'`
   */
  queryClientImportPath?: string;

  /**
   * 配置`RequestBuilder` 路径，导入的变量必须是命名为`RequestBuilder`
   * @example `import RequestBuilder from '@/utils/RequestBuilder'`
   * @default `import { RequestBuilder } from '@dune2/tools'`
   */
  RequestBuilderImportPath?: string;

  /**
   * 是否启用ts，`true`会生成`.ts`文件，`false`会生成`.js`文件
   * @default true
   */
  enableTs?: boolean;

  /**
   * 响应的scheme转换，默认获取获取 data 字段，取不到回退到 scheme
   * @default (schema) => schema.properties?.data ?? schema
   */
  responseSchemaTransformer?: (schema: OpenAPIV3.SchemaObject) => any;
  /**
   * 是否启用
   * @internal
   */
  enabled?: boolean;

  /**
   * 生成代码完毕后是否自动格式化，默认格式化
   * 需要安装 prettier
   * @default true
   */
  format?: boolean;
  /**
   * url 转换器，可以是字符串，也可以是函数
   *
   * 字符串会被当成prefix, 会在url前面加上
   *
   * 函数会被当成转换器
   */
  urlTransformer?: string | ((url: string) => string);
}

export interface Config {
  i18n?: I18nConfig[];
  api?: ApiConfig[];
  /**
   * 默认是 命令运行的目录，一般是项目根目录
   * @internal
   */
  cwd?: string;

  /**
   * 默认是 node_modules/.cache/dune-cli
   * @internal
   */
  cacheDir?: string;
}
