import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import pMap from "p-map";
import { createLogger } from "../../shared";
import { getConfig, ApiConfig } from "../../shared/config";
import fs from "fs-extra";
import * as os from "os";
import SwaggerParser from "@apidevtools/swagger-parser";
import { compile } from "json-schema-to-typescript";
import path from "path";

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
              const outputPath = path
                .join(apiConfig.output!, url, `${method}.ts`)
                .replace(/:/g, "_");
              await fs.ensureFile(outputPath);
              await fs.writeFile(outputPath, code);
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

  const requestBuilderName = _.camelCase(`${url}_${method}_api`);
  //#region url上参数 例如 /api/v1/users/{userId}
  const urlPathParams = getUrlPathParams(
    (operationObject.parameters as never) ?? []
  );
  const urlPathParamsCode = urlPathParams.length
    ? `urlPathParams: ${JSON.stringify(urlPathParams)},`
    : "";
  //#endregion

  let code: string[] = [
    "// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖",
    `import { RequestBuilder } from '@dune2/tools';`,
    apiConfig.requestFnImportPath!,
    `\
/**
 * ${operationObject.summary}
 * @tags ${operationObject.tags?.join(",")}
 * @see ${seeUrl}
 */`,
  ];

  // builder 代码
  code.push(`\
export const ${requestBuilderName} = new RequestBuilder<${requestBuilderName}.Req, ${requestBuilderName}.Res>({
  url: '${url}',
  method: '${method}',
  requestFn,
  ${urlPathParamsCode}
});`);

  // 请求参数类型
  // 响应参数类型
  const [requestParamsTypeCode, responseParamsTypeCode] = await Promise.all([
    compileRequestParams(operationObject),
    compileResponseParams(operationObject),
  ]);

  code.push(`
export namespace ${requestBuilderName} {
 ${requestParamsTypeCode}
 
 ${responseParamsTypeCode}
};`);

  return code.join(os.EOL);
}

function getUrlPathParams(parameters: OpenAPIV3.ParameterObject[]) {
  return parameters
    .filter((item) => item.in === "path")
    .map((item) => item.name);
}

/**
 * 这个方法还不完善，只能处理简单的请求参数
 */
async function compileRequestParams(
  operationObject: OpenAPIV3.OperationObject
) {
  let schema;
  if (operationObject.parameters) {
    // FIXME: 这里还需要处理 ref 类型
    const parameters =
      (operationObject.parameters as OpenAPIV3.ParameterObject[]).filter(
        (p) => p.in === "query" || p.in === "path"
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
    schema = {
      required,
      type: "object",
      properties,
    };
  } else if (operationObject.requestBody) {
    //TODO: 这里也需要处理其他类型
    schema = (operationObject.requestBody as OpenAPIV3.RequestBodyObject)
      .content["application/json"].schema;
  }

  let code = "";
  if (schema) {
    code = await compile(schema, "Req", {
      bannerComment: "",
      ignoreMinAndMaxItems: !!1,
      // format: false,
    });
  }

  return code ? code : "export type Req = any;";
}

async function compileResponseParams(
  operationObject: OpenAPIV3.OperationObject
) {
  const temp = operationObject.responses["200"] as OpenAPIV3.ResponseObject;
  let code = "";
  if (temp?.content) {
    // FIXME: 可能需要处理其他的content类型
    const temp2 = temp.content["application/json"] || temp.content["*/*"];
    const schema = temp2.schema as OpenAPIV3.SchemaObject;
    const data = schema.properties?.data ?? schema;
    if (data) {
      code = await compile(data, "Res", {
        bannerComment: "",
        ignoreMinAndMaxItems: !!1,
        // format: false,
      });
    }
  }

  return code ? code : "export type Res = any;";
}
