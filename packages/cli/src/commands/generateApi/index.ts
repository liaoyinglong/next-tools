import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import pMap from "p-map";
import { createLogger } from "../../shared";
import { getConfig, ApiConfig } from "../../shared/config";
import fs from "fs-extra";
import * as os from "os";

const log = createLogger("generateApi");

export async function generateApi() {
  const config = await getConfig();

  const { default: SwaggerParser } = await import(
    "@apidevtools/swagger-parser"
  );
  for (const apiConfig of config.api ?? []) {
    log.info(`清除旧的api文件: ${apiConfig.output}`);
    await fs.emptydir(apiConfig.output!);
  }

  for (const apiConfig of config.api ?? []) {
    log.info("开始解析 %s", apiConfig.swaggerJSONPath);
    const parsed = (await SwaggerParser.dereference(
      apiConfig.swaggerJSONPath
    )) as OpenAPIV3.Document;

    await pMap(Object.entries(parsed.paths), async ([url, pathItemObject]) => {
      log.info("开始生成 %s", url);
      if (pathItemObject) {
        ["get", "put", "post", "delete", "patch"].forEach((method) => {
          const operationObject = pathItemObject[method];
          if (operationObject) {
            const code = generateApiRequestCode({
              url: url,
              method: method,
              operationObject: operationObject,
              apiConfig,
            });
          }
        });
      }
    });
  }

  log.info("generateApi Done");
}

/**
 * 根据请求方法，生成请求代码
 */
export function generateApiRequestCode(options: {
  url: string;
  method: string;
  operationObject: OpenAPIV3.OperationObject;
  apiConfig: ApiConfig;
}): string {
  const { url, method, operationObject, apiConfig } = options;

  const seeUrl = apiConfig.swaggerUiUrl
    ? `${apiConfig.swaggerUiUrl}#/${encodeURIComponent(
        operationObject.tags?.join("/") ?? ""
      )}/${operationObject.operationId}`
    : "not found swagger ui url";

  const requestBuilderName = _.camelCase(url + "_api_" + method);
  let code: string[] = [
    "// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖",
    `import { RequestBuilder } from '@dune2/tools';`,
    `import requestFn  from '${apiConfig.requestFnPath}';`,
    `/**
 * ${operationObject.summary}
 * @tags ${operationObject.tags?.join(",")}
 * @see ${seeUrl}
 */`,
  ];
  code.push(`export const ${requestBuilderName} = new RequestBuilder({
  url: '${url}',
  method: '${method}',
  requestFn,
})`);

  return code.join(os.EOL);
}
