import type { NodePath } from '@babel/traverse';
import type { VariableDeclarator } from '@babel/types';
import t from '@babel/types';
import { handleSelectorArgument } from './shared';

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
  // 进入主流程
  const selectorName = path.scope.generateUidIdentifier('selector_');

  // 创建 selector 函数，使用相同的解构模式
  const selector = t.functionDeclaration(
    selectorName,
    [t.cloneDeepWithoutLoc(id)],
    t.blockStatement([
      t.returnStatement(
        t.objectExpression(
          id.properties.map((v) => {
            if (t.isRestElement(v)) {
              if (!t.isIdentifier(v.argument)) {
                throw path.buildCodeFrameError(
                  'Rest element in object pattern must be a simple identifier',
                );
              }
              return t.spreadElement(t.cloneDeepWithoutLoc(v.argument));
            }
            return t.cloneDeepWithoutLoc(v);
          }),
        ),
      ),
    ]),
  );

  // 插入 selector 函数声明
  path.parentPath.insertBefore(selector);

  // 修改为使用 useShallowSnapshot 并传入选择器
  callee.property.name = 'useShallowSnapshot';
  init.arguments = [selectorName];
}
