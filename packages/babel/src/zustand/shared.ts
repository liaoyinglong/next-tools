import type { CallExpression, Expression, Identifier } from "@babel/types";
import t from "@babel/types";

let useSnapshotFnName = "useSnapshot";

/**
 * 判断是否是 useSnapshot 的调用
 */
export function isUseSnapshotCall(node: CallExpression): boolean {
  const callee = node.callee;

  let identifier: Identifier | null = null;

  if (t.isIdentifier(callee)) {
    // case: useSnapshot()
    identifier = callee;
  } else if (t.isMemberExpression(callee)) {
    if (t.isIdentifier(callee.property)) {
      // case: store.useSnapshot()
      identifier = callee.property;
    }
  }

  if (identifier) {
    return identifier.name === useSnapshotFnName;
  }
  return false;
}
export function isNeedTransform(node: Expression | null | undefined): boolean {
  if (!node || !t.isCallExpression(node)) {
    return false;
  }
  if (!isUseSnapshotCall(node)) {
    return false;
  }
  // 定义了 args，不需要转换
  // case:
  // - useSnapshot(s=>s.a)
  // - useSnapshot(s=>({a:s.a}))
  return !node.arguments.length;
}
