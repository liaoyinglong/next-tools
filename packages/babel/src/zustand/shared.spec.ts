import { parseExpression } from "@babel/parser";
import t, { type Expression } from "@babel/types";
import { assert, describe, expect, it } from "vitest";
import { isNeedTransform, isUseSnapshotCall } from "./shared";

function runTest({
  code,
  expected,
  fn,
}: {
  code: string;
  expected: boolean;
  fn: (path: Expression) => void;
}) {
  const path = parseExpression(code);
  if (t.isCallExpression(path)) {
    expect(fn(path)).toBe(expected);
  } else {
    assert.fail("not a call expression");
  }
}

describe("isUseSnapshotCall", () => {
  it("should return true if the call expression is a useSnapshot call", () => {
    runTest({
      code: "store.useSnapshot()",
      expected: true,
      fn: isUseSnapshotCall,
    });
    runTest({ code: "useSnapshot()", expected: true, fn: isUseSnapshotCall });
    runTest({ code: "useSnapshot2()", expected: false, fn: isUseSnapshotCall });
  });
});

describe("isNeedTransform", () => {
  it("should return true if the call expression is a useSnapshot call without arguments", () => {
    runTest({
      code: "store.useSnapshot()",
      expected: true,
      fn: isNeedTransform,
    });
    runTest({
      code: "store.useSnapshot(s=>s.a)",
      expected: false,
      fn: isNeedTransform,
    });
    runTest({
      code: "store.useSnapshot(s=>({a:s.a}))",
      expected: false,
      fn: isNeedTransform,
    });
  });
});
