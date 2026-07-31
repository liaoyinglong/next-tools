import type { NodePath } from '@babel/traverse';
import type { VariableDeclarator } from '@babel/types';
import * as t from '@babel/types';
import { handleSelectorArgument } from './shared';

function objectPatternToExpression(
  pattern: t.ObjectPattern,
  path: NodePath,
): t.ObjectExpression {
  return t.objectExpression(
    pattern.properties.map((property) => {
      if (t.isRestElement(property)) {
        if (!t.isIdentifier(property.argument)) {
          throw path.buildCodeFrameError(
            'Rest element in object pattern must be a simple identifier',
          );
        }
        return t.spreadElement(t.cloneDeepWithoutLoc(property.argument));
      }

      const cloned = t.cloneDeepWithoutLoc(property);
      if (t.isObjectPattern(cloned.value)) {
        cloned.value = objectPatternToExpression(cloned.value, path);
      }
      return cloned;
    }),
  );
}

/**
 * 处理 store.useSnapshot() 的变量声明
 * 示例: const { a, c: { name } } = store.useSnapshot()
 * 将会转换为:
 * function selector({ a, c: { name } } ) { return { a, c: { name } }  }
 * const { a, c: { name } }  = store.useShallowSnapshot(selector)
 */
export function handleObjectPattern(path: NodePath<VariableDeclarator>) {
  const { id, init } = path.node;

  // 预检查：确保是 CallExpression 且变量是 ObjectPattern
  if (!t.isCallExpression(init) || !t.isObjectPattern(id)) {
    return;
  }
  if (!t.isMemberExpression(init.callee)) {
    return;
  }

  // 检查是否为 store.useSnapshot 调用
  const callee = init.callee;
  if (
    !t.isIdentifier(callee.property) ||
    callee.property.name !== 'useSnapshot'
  ) {
    return;
  }
  // 如果已经有 selector 参数，则不需要转换
  if (init.arguments.length > 0) {
    if (handleSelectorArgument(init)) {
      callee.property.name = 'useShallowSnapshot';
    }
    return;
  }

  // 进入主流程
  const selectorName = path.scope.generateUidIdentifier('selector_');

  // 创建 selector 函数，使用相同的解构模式
  const selector = t.functionDeclaration(
    selectorName,
    [t.cloneDeepWithoutLoc(id)],
    t.blockStatement([t.returnStatement(objectPatternToExpression(id, path))]),
  );

  // 将 selector 函数提升到组件外部，使其更持久化
  const funcParent =
    path.findParent(
      (p) =>
        p.isFunctionDeclaration() ||
        p.isFunctionExpression() ||
        p.isArrowFunctionExpression(),
    ) ?? path.parentPath;

  // 找到可以插入语句的位置：向上找到最近的 Statement 级别节点
  let insertTarget = funcParent;
  while (insertTarget && !insertTarget.isStatement()) {
    insertTarget = insertTarget.parentPath!;
  }
  (insertTarget ?? funcParent).insertBefore(selector);

  // 修改为使用 useShallowSnapshot 并传入选择器
  callee.property.name = 'useShallowSnapshot';
  init.arguments = [selectorName];
}
