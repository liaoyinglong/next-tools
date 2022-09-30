import { describe, it, expect } from "vitest";
import { generateApiRequestCode } from "../src/commands/generateApi";

describe("api 生成", function () {
  it("generateByOperationObject 参数在url上", async () => {
    const operationObject = {
      tags: ["后台用户管理相关接口"],
      summary: "查询单个后台用户信息",
      operationId: "queryUserById",
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          description: "用户id",
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
                      "请求结果的状态码.如果这个值返回的是200, 那么就代表业务处理成功了",
                    example: "200",
                  },
                  message: {
                    type: "string",
                    description:
                      "请求结果的描述. 如果业务处理失败，将会描述失败的原因.",
                    example: "success",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        description: "用户id",
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
                        description: "用户状态(ACTIVE, INACTIVE)",
                        enum: ["NEW", "ACTIVE", "INACTIVE"],
                      },
                      areaCode: {
                        type: "string",
                        description: "手机区号",
                      },
                      phoneNumber: {
                        type: "string",
                        description: "手机号",
                      },
                      remark: {
                        type: "string",
                        description: "备注",
                      },
                      updatedBy: {
                        type: "integer",
                        description: "更新用户id",
                        format: "int64",
                      },
                      updatedRealName: {
                        type: "string",
                        description: "更新的用户名",
                      },
                      updatedTime: {
                        type: "string",
                        description: "更新时间",
                        format: "date-time",
                      },
                    },
                    description: "查询用户响应结果",
                  },
                  requestId: {
                    type: "string",
                    description: "请求ID",
                    example: "00000001",
                  },
                },
                description: "HTTP响应的统一结构体",
              },
            },
          },
        },
      },
    };

    const result = await generateApiRequestCode({
      url: "/users",
      method: "get",
      operationObject: operationObject as never,
      apiConfig: {
        requestFnPath: "@/utils/http",
        swaggerUiUrl:
          "http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API",
      } as never,
    });
    expect(result).toMatchSnapshot();
  });

  it("参数在body里", async function () {
    const obj = {
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
                  description: "页码数, 该值的范围是1~1024",
                  format: "int32",
                  example: 1,
                },
                pageSize: {
                  maximum: 99999,
                  minimum: 1,
                  type: "integer",
                  description: "页大小, 该值的范围是1~99999",
                  format: "int32",
                  example: 1,
                },
                count: {
                  type: "boolean",
                  description:
                    "是否查询总记录数。查询总记录数会严重影响性能，非必要不查询. ",
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
                      description: "币种状态(NEW, ACTIVE, INACTIVE)",
                      enum: ["NEW", "ACTIVE", "INACTIVE"],
                    },
                  },
                  description: "币种列表查询参数",
                },
                orders: {
                  maxItems: 10,
                  minItems: 0,
                  type: "array",
                  description: "分页查询的排序规则, 最大不能超过10个排序字段",
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
                      "请求结果的状态码.如果这个值返回的是200, 那么就代表业务处理成功了",
                    example: "200",
                  },
                  message: {
                    type: "string",
                    description:
                      "请求结果的描述. 如果业务处理失败，将会描述失败的原因.",
                    example: "success",
                  },
                  data: {
                    required: ["result"],
                    type: "object",
                    properties: {
                      total: {
                        type: "integer",
                        description:
                          "总记录数。如果请求参数中'是否查询总记录数'为true则此参数将会返回.",
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
                                  description: "币种id",
                                  format: "int64",
                                },
                                sourceId: {
                                  type: "integer",
                                  description:
                                    "crypto来源Id，crypto_datasource表的Id",
                                  format: "int64",
                                },
                                name: {
                                  type: "string",
                                  description: "Coin的名称，如：Bitcoin",
                                },
                                code: {
                                  type: "string",
                                  description: "Coin的符号，如：BTC",
                                },
                                status: {
                                  type: "string",
                                  description: "币种状态(NEW,ACTIVE,INACTIVE)",
                                },
                                decimals: {
                                  type: "integer",
                                  description: "资产显示精度",
                                  format: "int32",
                                },
                                iconUrl: {
                                  type: "string",
                                  description: "币种icon",
                                },
                                canDeposit: {
                                  type: "boolean",
                                  description: "支持充值",
                                },
                                canWithdraw: {
                                  type: "boolean",
                                  description: "支持体现",
                                },
                                remarks: {
                                  type: "string",
                                  description: "备注",
                                },
                                createdBy: {
                                  type: "integer",
                                  description: "创建人id",
                                  format: "int64",
                                },
                                createdRealName: {
                                  type: "string",
                                  description: "创建人",
                                },
                                updatedBy: {
                                  type: "integer",
                                  description: "更新人id",
                                  format: "int64",
                                },
                                updatedRealName: {
                                  type: "string",
                                  description: "更新人",
                                },
                                createdTime: {
                                  type: "integer",
                                  description: "创建时间",
                                  format: "int64",
                                },
                                updatedTime: {
                                  type: "integer",
                                  description: "更新时间",
                                  format: "int64",
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
                                    description: "表Id，coin唯一标识",
                                    format: "int64",
                                  },
                                  coinId: {
                                    type: "integer",
                                    description:
                                      "币种的唯一标识，用于将网络关联到币种",
                                    format: "int64",
                                  },
                                  networkTypeId: {
                                    type: "integer",
                                    description: "网络类型Id",
                                    format: "int64",
                                  },
                                  networkTypeName: {
                                    type: "string",
                                    description:
                                      "network对应的网络名称，例如Ethereum",
                                  },
                                  protocolTypeId: {
                                    type: "integer",
                                    description: "协议类型Id",
                                    format: "int64",
                                  },
                                  protocolTypeName: {
                                    type: "string",
                                    description: "network对应的协议，例如ERC20",
                                  },
                                  canMemo: {
                                    type: "boolean",
                                    description: "是否支持充币或者提币标签备注",
                                  },
                                  canDeposit: {
                                    type: "boolean",
                                    description: "支持充值",
                                  },
                                  canWithdraw: {
                                    type: "boolean",
                                    description: "支持提现",
                                  },
                                  withdrawFees: {
                                    type: "string",
                                    description:
                                      "Crypto中台收取的提币或者充币手续费用",
                                  },
                                  minWithdrawAmount: {
                                    type: "string",
                                    description: "最小提币数量",
                                  },
                                  assetId: {
                                    type: "string",
                                    description: "资产Id",
                                  },
                                  assetSource: {
                                    type: "string",
                                    description:
                                      "资产来源。FireBlocks CyraWallet",
                                  },
                                  status: {
                                    type: "string",
                                    description: "网络状态",
                                  },
                                  remarks: {
                                    type: "string",
                                    description: "备注",
                                  },
                                  createdBy: {
                                    type: "integer",
                                    description: "创建人ID",
                                    format: "int64",
                                  },
                                  updatedBy: {
                                    type: "integer",
                                    description: "更新人ID",
                                    format: "int64",
                                  },
                                  createdTime: {
                                    type: "integer",
                                    description: "创建时间",
                                    format: "int64",
                                  },
                                  updatedTime: {
                                    type: "integer",
                                    description: "更新时间",
                                    format: "int64",
                                  },
                                },
                                description: "区块网络返回结果",
                              },
                            },
                          },
                          description: "coin分页查询结果",
                        },
                      },
                      extra: {
                        type: "object",
                        additionalProperties: {
                          type: "object",
                          description: "附加值",
                        },
                        description: "附加值",
                      },
                    },
                    description: "分页查询结果统计结构体",
                  },
                  requestId: {
                    type: "string",
                    description: "请求ID",
                    example: "00000001",
                  },
                },
                description: "HTTP响应的统一结构体",
              },
            },
          },
        },
      },
    };
    const result = await generateApiRequestCode({
      url: "/coins:page-search",
      method: "post",
      operationObject: obj as never,
      apiConfig: {
        requestFnPath: "@/utils/http",
        swaggerUiUrl:
          "http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API",
      } as never,
    });
    expect(result).toMatchSnapshot();
  });
});
