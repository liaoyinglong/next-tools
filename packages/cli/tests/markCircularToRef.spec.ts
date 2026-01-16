import { describe, expect, it } from "vitest";
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
      description: "response data",
      items: {
        type: "object",
        properties: {
          children: {
            type: "array",
            description: "Subresource list",
            items: {},
          },
        },
      },
    };
    schema.items.properties.children.items = schema.items;

    markCircularToRef(schema);
    expect(schema).toMatchInlineSnapshot(`
      {
        "description": "response data",
        "items": {
          "properties": {
            "children": {
              "description": "Subresource list",
              "items": {
                "$ref": "#/items",
              },
              "type": "array",
            },
          },
          "type": "object",
        },
        "type": "array",
      }
    `);
  });
});
