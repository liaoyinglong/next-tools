import { parseExpression } from "@babel/parser";
import t from "@babel/types";
import { assert, describe, expect, it } from "vitest";
import { isUseSnapshotCall } from "./isUseSnapshotCall";

function runTest(code: string, expected: boolean) {
  const path = parseExpression(code);
  if (t.isCallExpression(path)) {
    expect(isUseSnapshotCall(path)).toBe(expected);
  } else {
    assert.fail("not a call expression");
  }
}

describe("isUseSnapshotCall", () => {
  it("should return true if the call expression is a useSnapshot call", () => {
    runTest("store.useSnapshot()", true);
    runTest("useSnapshot()", true);

    runTest("useSnapshot2()", false);
  });
});
