import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import pMap from "p-map";
import { createLogger } from "../../shared";
import { getConfig, ApiConfig } from "../../shared/config";
import fs from "fs-extra";
import * as os from "os";
import SwaggerParser from "@apidevtools/swagger-parser";
import { compile } from "json-schema-to-typescript";

const log = createLogger("generateApi");

export async function generateApi() {
  const config = await getConfig();

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
        await pMap(
          ["get", "put", "post", "delete", "patch"],
          async (method) => {
            const operationObject = pathItemObject[method];
            if (operationObject) {
              const code = await generateApiRequestCode({
                url: url,
                method: method,
                operationObject: operationObject,
                apiConfig,
              });
            }
          }
        );
      }
    });
  }

  log.info("generateApi Done");
}

/**
 * 根据请求方法，生成请求代码
 */
export async function generateApiRequestCode(options: {
  url: string;
  method: string;
  operationObject: OpenAPIV3.OperationObject;
  apiConfig: ApiConfig;
}): Promise<string> {
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

  // builder 代码
  code.push(`export const ${requestBuilderName} = new RequestBuilder<${requestBuilderName}.Req,${requestBuilderName}.Res>({
  url: '${url}',
  method: '${method}',
  requestFn,
})`);

  // 请求参数类型
  const requestParamsTypeCode = await compileRequestParams(operationObject);

  code.push(`
export namespace ${requestBuilderName} {
 ${requestParamsTypeCode}
}
`);

  return code.join(os.EOL);
}

/**
 * 这个方法还不完善，只能处理简单的请求参数
 */
export async function compileRequestParams(
  operationObject: OpenAPIV3.OperationObject
) {
  if (operationObject.parameters) {
    // FIXME: 这里还需要处理 ref 类型
    const parameters =
      (operationObject.parameters as OpenAPIV3.ParameterObject[]).filter(
        (p) => p.in === "query"
      ) ?? [];

    const required = parameters.filter((p) => p.required).map((p) => p.name);
    const properties = Object.fromEntries(
      parameters.map((p) => {
        //TODO: 这里也要处理 ref 类型
        const schema = p.schema as OpenAPIV3.SchemaObject;
        return [
          p.name,
          {
            type: schema.type,
            description: p.description,
            // enum: schema.enum ?? [],
          },
        ];
      })
    );

    return await compile(
      {
        required,
        type: "object",
        properties,
      },
      "Req",
      {
        bannerComment: "",
        // format: false,
      }
    );
  }
}