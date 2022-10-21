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
});
