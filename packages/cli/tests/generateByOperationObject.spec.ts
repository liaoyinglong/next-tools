import { describe, it, expect } from "vitest";
import { generateApiRequestCode } from "../src/commands/generateApi";

describe("api 生成", function () {
  it("generateByOperationObject", async () => {
    const operationObject = {
      tags: ["后台用户管理相关接口"],
      summary: "查询单个后台用户信息",
      operationId: "queryUserById",
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
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

    const result = generateApiRequestCode({
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
});
