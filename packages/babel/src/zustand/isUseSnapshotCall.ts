import type { CallExpression, Identifier } from "@babel/types";
import t from "@babel/types";

let useSnapshotFnName = "useSnapshot";

export function isUseSnapshotCall(node: CallExpression): boolean {
  const callee = node.callee;

  let identifier: Identifier | null = null;

  if (t.isIdentifier(callee)) {
    identifier = callee;
  } else if (t.isMemberExpression(callee)) {
    if (t.isIdentifier(callee.property)) {
      identifier = callee.property;
    }
  }

  if (identifier) {
    return identifier.name === useSnapshotFnName;
  }
  return false;
}
