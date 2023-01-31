import { describe, it, expect } from "vitest";
import { markCircularToRef } from "../src/commands/generateApi";

const circularObj = {
  OperationResultListRoleVO: {
    required: ["code", "message", "requestId"],
    type: "object",
    properties: {
      message: {
        type: "string",
      },
      data: {},
      test: {
        propertiesRef: {},
      },
    },
  },
};

circularObj.OperationResultListRoleVO.properties.data = circularObj;
circularObj.OperationResultListRoleVO.properties.test.propertiesRef =
  circularObj.OperationResultListRoleVO.properties;

describe("markCircularToRef", () => {
  it("should resolve sheet id from url", function () {
    markCircularToRef(circularObj);

    expect(circularObj.OperationResultListRoleVO.properties.data)
      .toMatchInlineSnapshot(`
      {
        "$ref": "#",
      }
    `);
    expect(circularObj.OperationResultListRoleVO.properties.test.propertiesRef)
      .toMatchInlineSnapshot(`
        {
          "$ref": "#/OperationResultListRoleVO/properties",
        }
      `);
  });

  it("should support root circular", function () {
    const schema = {
      type: "array",
      description: "请求返回的结果",
      items: {
        type: "object",
        properties: {
          orderId: {
            type: "integer",
            description: "订单id（全局唯一）",
            format: "int64",
          },
          symbol: {
            type: "string",
            description: "交易对符号",
          },
          side: {
            type: "string",
            description: "交易方向",
            enum: ["BUY", "SELL"],
          },
          status: {
            type: "string",
            description: "限价单的触发类型",
            enum: [
              "NEW",
              "PARTIALLY_FILLED",
              "FILLED",
              "CANCELLED",
              "TRIGGERED",
              "TRAILING",
              "REJECTED",
              "EXPIRED",
            ],
          },
          orderType: {
            type: "string",
            description: "委托单类型.LIMIT-限价单,MARKET-市价单",
            enum: [
              "MARKET",
              "LIMIT",
              "TRIGGER_LIMIT",
              "TRIGGER_MARKET",
              "STOP_LIMIT",
              "STOP_MARKET",
              "OCO",
            ],
          },
          limitPrice: {
            type: "number",
            description: "限价单的委托价",
          },
          size: {
            type: "number",
            description: "委托数量. 买单对应base的数量，卖单对应counter的数量",
          },
          quoteSize: {
            type: "number",
            description: "市价类订单字段，市价类委托要求和size二选一",
          },
          tradePrice: {
            type: "number",
            description: "成交均价",
          },
          filledSize: {
            type: "number",
            description: "已完成数量（base）",
          },
          triggerPrice: {
            type: "number",
            description: "触发价格",
          },
          priceTriggered: {
            type: "boolean",
            description: "价格是否已触发（triggerType不为空时有值）",
          },
          trailingDelta: {
            type: "number",
            description: "回调幅度",
          },
          trailingDeltaTriggered: {
            type: "boolean",
            description: "回调幅度是否已触发（triggerType不为空时有值）",
          },
          createdTime: {
            type: "string",
            description: "订单创建时间",
            format: "date-time",
          },
          updatedTime: {
            type: "string",
            description: "订单最近一次更新时间",
            format: "date-time",
          },
          orders: {
            type: "array",
            description: "子单列表（OCO类型订单该属性才有值）",
            items: {
              $ref: "#/items",
            },
          },
        },
        description: "分页查询的结果",
      },
    };
  });
});
