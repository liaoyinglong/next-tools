import type { CallExpression } from '@babel/types';
import t from '@babel/types';

/**
 * 检查 selector 参数的返回值类型
 * 如果返回值是对象类型，则将 useSnapshot 转换为 useShallowSnapshot
 */
export function handleSelectorArgument(init: CallExpression) {
  const selector = init.arguments[0];
  if (
    t.isFunctionExpression(selector) ||
    t.isArrowFunctionExpression(selector)
  ) {
    const body = selector.body;
    if (t.isBlockStatement(body)) {
      const returnStmt = body.body.find((stmt) => t.isReturnStatement(stmt));
      if (
        returnStmt &&
        t.isReturnStatement(returnStmt) &&
        t.isObjectExpression(returnStmt.argument)
      ) {
        return true;
      }
    } else if (t.isObjectExpression(body)) {
      return true;
    }
  }
  return false;
}
