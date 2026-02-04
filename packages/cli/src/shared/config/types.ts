import type SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';

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
   * 配置`queryClient` 路径，导入的变量必须是命名为`queryClient`
   * @example `import queryClient from '@/utils/request'`
   * @example `import { queryClient } from '@/utils/request'`
   * @example `import { xxClient as queryClient } from '@/utils/request'`
   */
  queryClientImportPath?: string;

  /**
   * 配置`RequestBuilder` 路径，导入的变量必须是命名为`RequestBuilder`
   * @example `import RequestBuilder from '@/utils/RequestBuilder'`
   * @default `import { RequestBuilder } from '@dune2/tools/rq'`
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
   * 生成代码完毕后执行的代码格式化命令
   * 用户可自定义格式化工具及参数
   * @default "oxfmt"
   */
  codeFormatterCmd?: string;
  /**
   * url 转换器，可以是字符串，也可以是函数
   *
   * 字符串会被当成prefix, 会在url前面加上
   *
   * 函数会被当成转换器
   *
   * @tips 不会影响文件名，只会影响生成的代码里的url字段
   */
  urlTransformer?: string | ((url: string) => string);

  /**
   * 配置 dereference 的参数
   */
  dereferenceSwaggerConfig?: SwaggerParser.Options;
}

export interface Config {
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
