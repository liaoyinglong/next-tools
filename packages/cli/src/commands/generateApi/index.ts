import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "fs-extra";
import { compile } from "json-schema-to-typescript";
import _ from "lodash";
import { OpenAPIV3 } from "openapi-types";
import * as os from "os";
import pMap from "p-map";
import path from "path";
import { createLogger } from "../../shared";
import { ApiConfig, getConfig } from "../../shared/config";
import { formatFile } from "../../shared/formatFile";
import { promptApiConfigEnable } from "../../shared/promptConfigEnable";

const log = createLogger("generateApi");

export async function generateApi() {
  const config = await getConfig();
  const apiConfigs = await promptApiConfigEnable(config.api);

  for (const apiConfig of apiConfigs) {
    log.info(`清除旧的api文件: ${apiConfig.output}`);
    await fs.emptydir(apiConfig.output!);
  }

  for (const apiConfig of apiConfigs) {
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
                .join(
                  apiConfig.output!,
                  url,
                  apiConfig.enableTs ? `${method}.ts` : `${method}.js`
                )
                .replace(/:/g, "_");
              await fs.ensureFile(outputPath);
              await fs.writeFile(outputPath, code);
            }
          }
        );
      }
    });

    if (apiConfig.format) {
      await formatFile(apiConfig.output!);
    }
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
  const { method, operationObject, apiConfig } = options;

  const url = (() => {
    if (typeof apiConfig.urlTransformer === "string") {
      return `${apiConfig.urlTransformer}${options.url}`;
    }
    if (typeof apiConfig.urlTransformer === "function") {
      return apiConfig.urlTransformer(options.url);
    }
    return options.url;
  })();

  const seeUrl = apiConfig.swaggerUiUrl
    ? `${apiConfig.swaggerUiUrl}#/${operationObject.tags?.join("/") ?? ""}/${operationObject.operationId
    }`
    : "";

  // 生成的请求构造器的名称，需要使用原始url
  let requestBuilderName = _.camelCase(`${options.url}_${method}_api`);

  // 判断是否有效的js变量
  if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(requestBuilderName)) {
    // 不是有效的js变量，使用 _ + 数字
    requestBuilderName = `_${requestBuilderName}`;
  }

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
    apiConfig.RequestBuilderImportPath!,
    apiConfig.requestFnImportPath!,
    apiConfig.queryClientImportPath!,

    "/**",
    `  * ${operationObject.summary}`,
    `  * @tags ${operationObject.tags?.join(",")}`,
    seeUrl && `  * @see ${seeUrl}`,
    `  */`,
  ].filter(Boolean);

  // builder 代码
  let builderCode = `\
export const ${requestBuilderName} = new RequestBuilder({
  url: '${url}',
  method: '${method}',
  ${apiConfig.requestFnImportPath ? "requestFn," : ""}
  ${urlPathParamsCode}
  ${apiConfig.queryClientImportPath ? "queryClient," : ""}
});`
    // 移除空行
    .replace(/,\n\s*}/, "," + os.EOL + "}");
  if (apiConfig.enableTs) {
    builderCode = builderCode.replace(
      "new RequestBuilder(",
      `new RequestBuilder<${requestBuilderName}.Req, ${requestBuilderName}.Res>(`
    );
  }
  code.push(builderCode);

  if (apiConfig.enableTs) {
    // post和put请求需要生成表单fieldsMap
    const isGenrateFieldsMap = [OpenAPIV3.HttpMethods.POST, OpenAPIV3.HttpMethods.PUT].includes(method as OpenAPIV3.HttpMethods);
    // 请求参数类型
    // 响应参数类型
    const [requestParamsTypeCode, responseParamsTypeCode] = await Promise.all([
      compileRequestParams(operationObject, isGenrateFieldsMap),
      compileResponseParams(operationObject, apiConfig),
    ]);

    code.push(`
export namespace ${requestBuilderName} {
 ${requestParamsTypeCode.code}
 
 ${responseParamsTypeCode}
};`);

    if (isGenrateFieldsMap) {
      // 生成表单fieldsMap
      code.push(`
export const ${requestBuilderName}FieldsMap = ${JSON.stringify(requestParamsTypeCode.fieldsMap)}
`)
    }

  }

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
  operationObject: OpenAPIV3.OperationObject,
  generateFieldsMap = false
) {
  let schema;
  if (operationObject.requestBody) {
    //TODO: 这里也需要处理其他类型
    schema = (operationObject.requestBody as OpenAPIV3.RequestBodyObject)
      .content["application/json"].schema;
  } else if (operationObject.parameters) {
    const extraProperties = {};
    const parameters: OpenAPIV3.ParameterObject[] = [];
    (operationObject.parameters as OpenAPIV3.ParameterObject[]).forEach(
      (item) => {
        if (!["query", "path"].includes(item.in)) {
          return;
        }
        if (_.get(item.schema, "type") === "object") {
          // swagger get 请求上 有些参数是 object 类型 应该拍平
          _.assign(extraProperties, _.get(item.schema, "properties", {}));
        } else {
          parameters.push(item);
        }
      }
    );

    // 必填参数中忽略 分页相关的参数
    const required = parameters
      .filter(
        (p) => p.required && !["pageNum", "pageSize", "count"].includes(p.name)
      )
      .map((p) => p.name);
    const properties = Object.fromEntries(
      parameters
        // 后端 swagger 可能出现没有 schema 的情况，这里过滤掉
        .filter((p) => !!p.schema)
        .map((p) => {
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
      properties: { ...properties, ...extraProperties },
    };
  }

  let code = "";
  const fieldsMap: Record<string, string> = {};
  if (schema) {
    try {
      code = await compile(schema, "Req", {
        bannerComment: "",
        ignoreMinAndMaxItems: !!1,
        additionalProperties: false,
        // format: false,
      });

      // 判断接口是否是分页请求
      const isPageSearchRequest = (data: any) => {
        // 入参有这些字段就认为是分页查询接口
        const keys = ['pageNum', 'pageSize', 'count'];
        return _.get(data, 'type') === 'object' &&
          _.get(data, 'required', []).filter(item => keys.includes(item)).length === keys.length
      }

      if (generateFieldsMap) {
        // 分页查询接口取params字段
        const params = isPageSearchRequest(schema) ? _.get(schema, 'properties.params.properties', {}) : schema.properties;
        _.forEach(params, (_, field) => {
          fieldsMap[field] = field
        })
      }
    } catch (e) {
      log.error("生成请求参数类型失败，请检查 %o", {
        summary: operationObject.summary,
        message: e.message,
      });
    }
  }

  return {
    code: code || "export type Req = any;",
    fieldsMap
  }
}

async function compileResponseParams(
  operationObject: OpenAPIV3.OperationObject,
  apiConfig: ApiConfig
) {
  const temp = operationObject.responses["200"] as OpenAPIV3.ResponseObject;
  let code = "";
  if (temp?.content) {
    // FIXME: 可能需要处理其他的content类型
    const temp2 = temp.content["application/json"] || temp.content["*/*"];
    const schema = temp2.schema as OpenAPIV3.SchemaObject;
    let data = apiConfig.responseSchemaTransformer!(schema);
    if (data) {
      // 这里需要深度clone的原因是：
      // 解析出来的scheme会尽可能的被复用，导致影响到下次解析
      data = _.cloneDeep(data);
      markCircularToRef(data);
      try {
        code = await compile(data, "Res", {
          bannerComment: "",
          ignoreMinAndMaxItems: !!1,
          additionalProperties: false,
          // format: false,
        });

        // 通过响应数据判断是否是分页查询接口
        const isPageSearchResponse = (data: any) => {
          // 有result字段且为数组，就认为是分页查询接口
          return _.get(data, 'type') === 'object' && _.get(data, 'properties.result.type') === 'array'
        }

        // 新增后端分页查询返回的数据类型
        if (isPageSearchResponse(data)) {
          code += `${os.EOL}export type ResultItem = Res['result'][0]`
        }
      } catch (e) {
        log.error("转换响应参数类型失败, 请检查 %o", {
          summary: operationObject.summary,
          error: e.message,
        });
      }
    } else {
      log.error("responseSchemaTransformer 返回值为空, 请检查");
    }
  }

  return code ? code : "export type Res = any;";
}

export function markCircularToRef(
  obj,
  parentMark = "#",
  map = new Map([[obj, parentMark]]),
  set = new Set([obj])
) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === "object" && !Array.isArray(value)) {
      if (set.has(value)) {
        obj[key] = { $ref: map.get(value) };
        return;
      }
      const tempMark = parentMark + "/" + key;
      set.add(value);
      map.set(value, tempMark);
      markCircularToRef(value, tempMark, map, set);
    }
  });
  return map;
}
