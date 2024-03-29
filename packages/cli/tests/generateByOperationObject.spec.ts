import { describe, expect, it } from "vitest";
import { generateApiRequestCode } from "../src/commands/generateApi";
import { apiConfigNormalizer } from "../src/shared/config/normalizeConfig";

const paramsInQuery = {
  tags: ["后台用户管理相关接口"],
  summary: "查询单个后台用户信息",
  operationId: "queryUserById",
  parameters: [
    {
      name: "id",
      in: "query",
      required: true,
      description: "用户 id",
      example: 1,
      schema: {
        type: "integer",
        format: "int64",
      },
    },
  ],
  responses: {
    "200": {
      description: "OK",
      content: {
        "*/*": {
          schema: {
            required: ["code", "message", "requestId"],
            type: "object",
            properties: {
              code: {
                type: "string",
                description:
                  "请求结果的状态码。如果这个值返回的是 200, 那么就代表业务处理成功了",
                example: "200",
              },
              message: {
                type: "string",
                description:
                  "请求结果的描述。如果业务处理失败，将会描述失败的原因。",
                example: "success",
              },
              data: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    description: "用户 id",
                    format: "int64",
                  },
                  email: {
                    type: "string",
                    description: "邮箱",
                  },
                  realName: {
                    type: "string",
                    description: "姓名",
                  },
                  status: {
                    type: "string",
                    description: "用户状态 (ACTIVE, INACTIVE)",
                    enum: ["NEW", "ACTIVE", "INACTIVE"],
                  },
                },
                description: "查询用户响应结果",
              },
              requestId: {
                type: "string",
                description: "请求 ID",
                example: "00000001",
              },
            },
            description: "HTTP 响应的统一结构体",
          },
        },
      },
    },
  },
};

const paramsInBody = {
  tags: ["币种管理相关接口"],
  summary: "分页查询币种信息",
  operationId: "pageSearch_4",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          required: ["count", "pageNum", "pageSize", "params"],
          type: "object",
          properties: {
            pageNum: {
              maximum: 1024,
              minimum: 1,
              type: "integer",
              description: "页码数，该值的范围是 1~1024",
              format: "int32",
              example: 1,
            },
            pageSize: {
              maximum: 99999,
              minimum: 1,
              type: "integer",
              description: "页大小，该值的范围是 1~99999",
              format: "int32",
              example: 1,
            },
            count: {
              type: "boolean",
              description:
                "是否查询总记录数。查询总记录数会严重影响性能，非必要不查询。",
              example: false,
            },
            params: {
              type: "object",
              properties: {
                nameOrCode: {
                  type: "string",
                  description: "币种代码或者币种名称",
                },
                status: {
                  type: "string",
                  description: "币种状态 (NEW, ACTIVE, INACTIVE)",
                  enum: ["NEW", "ACTIVE", "INACTIVE"],
                },
              },
              description: "币种列表查询参数",
            },
            orders: {
              maxItems: 10,
              minItems: 0,
              type: "array",
              description: "分页查询的排序规则，最大不能超过 10 个排序字段",
              items: {
                required: ["fieldName", "type"],
                type: "object",
                properties: {
                  fieldName: {
                    type: "string",
                    description: "字段名称",
                  },
                  type: {
                    type: "string",
                    description: "排序规则",
                    enum: ["asc", "desc"],
                  },
                },
                description: "分页查询排序字段结构体",
              },
            },
          },
          description: "分页查询统一结构体",
        },
      },
    },
    required: true,
  },
  responses: {
    "200": {
      description: "OK",
      content: {
        "*/*": {
          schema: {
            required: ["code", "message", "requestId"],
            type: "object",
            properties: {
              code: {
                type: "string",
                description:
                  "请求结果的状态码。如果这个值返回的是 200, 那么就代表业务处理成功了",
                example: "200",
              },
              message: {
                type: "string",
                description:
                  "请求结果的描述。如果业务处理失败，将会描述失败的原因。",
                example: "success",
              },
              data: {
                required: ["result"],
                type: "object",
                properties: {
                  total: {
                    type: "integer",
                    description:
                      "总记录数。如果请求参数中'是否查询总记录数'为 true 则此参数将会返回。",
                    format: "int64",
                  },
                  result: {
                    type: "array",
                    description: "分页查询的结果",
                    items: {
                      type: "object",
                      properties: {
                        coin: {
                          type: "object",
                          properties: {
                            id: {
                              type: "integer",
                              description: "币种 id",
                              format: "int64",
                            },
                            sourceId: {
                              type: "integer",
                              description:
                                "crypto 来源 Id，crypto_datasource 表的 Id",
                              format: "int64",
                            },
                            name: {
                              type: "string",
                              description: "Coin 的名称，如：Bitcoin",
                            },
                            code: {
                              type: "string",
                              description: "Coin 的符号，如：BTC",
                            },
                            status: {
                              type: "string",
                              description: "币种状态 (NEW,ACTIVE,INACTIVE)",
                            },
                          },
                          description: "币种管理",
                        },
                        networks: {
                          type: "array",
                          description: "币种支持的网络",
                          items: {
                            type: "object",
                            properties: {
                              id: {
                                type: "integer",
                                description: "表 Id，coin 唯一标识",
                                format: "int64",
                              },
                              coinId: {
                                type: "integer",
                                description:
                                  "币种的唯一标识，用于将网络关联到币种",
                                format: "int64",
                              },
                            },
                            description: "区块网络返回结果",
                          },
                        },
                      },
                      description: "coin 分页查询结果",
                    },
                  },
                },
                description: "分页查询结果统计结构体",
              },
              requestId: {
                type: "string",
                description: "请求 ID",
                example: "00000001",
              },
            },
            description: "HTTP 响应的统一结构体",
          },
        },
      },
    },
  },
};

const generate = (data, methods: string) => {
  return generateApiRequestCode({
    url: "/users",
    method: methods,
    operationObject: data,
    apiConfig: apiConfigNormalizer({
      swaggerJSONPath: "",
      swaggerUiUrl: "",
    }),
  });
};

describe("api 生成", function () {
  it("参数在 url 上", async () => {
    const result = await generate(paramsInQuery, "get");
    expect(result).toMatchSnapshot();
  });

  it("参数在 body 里", async function () {
    const result = await generate(paramsInBody, "post");
    expect(result).toMatchSnapshot();
  });

  it("参数或响应为空", async () => {
    let parmas = JSON.parse(JSON.stringify(paramsInBody));
    parmas.parameters = [];
    parmas.responses = {};
    delete parmas.requestBody;
    const result = await generate(parmas, "post");
    expect(result).toMatchSnapshot();
  });
  it("支持 urlTransformer", async () => {
    const f = (urlTransformer) => {
      return generateApiRequestCode({
        url: "/users",
        method: "get",
        operationObject: paramsInQuery as never,
        apiConfig: apiConfigNormalizer({
          swaggerJSONPath: "",
          swaggerUiUrl: "",
          urlTransformer,
        }),
      });
    };

    const result = await f("/api/v1");
    const result2 = await f((url) => `/api/v1${url}`);

    expect(result).toMatchSnapshot();
    expect(result2).toEqual(result);
  });
});
