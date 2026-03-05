import type { NodePath } from '@babel/traverse';
import type {
  MemberExpression,
  OptionalMemberExpression,
  VariableDeclarator,
} from '@babel/types';
import t from '@babel/types';
import { handleSelectorArgument } from './shared';
/**
 * 处理 store.useSnapshot() 的变量声明
 * 示例: const state = store.useSnapshot()
 * 将会转换为:
 * function selector(state) { return { _prop: state.a.b } }
 * const state = store.useShallowSnapshot(selector)
 */
export function handleIdentifierSnapshot(path: NodePath<VariableDeclarator>) {
  const { id, init } = path.node;

  // 预检查：确保是 CallExpression 且变量是标识符
  if (!t.isCallExpression(init) || !t.isIdentifier(id)) {
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

  // 如果已经有 selector 参数，则需要检查返回值类型
  // 如果返回值是对象类型，则转换为 useShallowSnapshot
  if (init.arguments.length > 0) {
    if (handleSelectorArgument(init)) {
      callee.property.name = 'useShallowSnapshot';
    }
    return;
  }

  // 初始化成员访问器数组和访问器映射
  // memberAccessors 用于存储所有的成员访问表达式
  // accessorMap 用于缓存已处理过的访问路径，避免重复创建
  const memberAccessors: MemberAccessor[] = [];
  const accessorMap = new Map<string, string>();
  {
    // 获取变量的绑定信息，用于查找所有引用
    const binding = path.scope.getOwnBinding(id.name);

    // 存储所有有效的成员表达式访问
    const arr: ReturnType<typeof findMemberExpression>[] = [];

    // 第一次遍历：收集所有有效的成员表达式
    binding?.referencePaths.forEach((refPath) => {
      const { memberExprStart, nodePath, accessKey } =
        findMemberExpression(refPath);
      if (memberExprStart && nodePath && accessKey) {
        arr.push({ memberExprStart, nodePath, accessKey });
      }
    });

    // 如果存在无效的成员表达式访问，则不进行转换
    if (!arr.length || arr.length !== binding?.referencePaths.length) {
      return;
    }

    // 第二次遍历：处理每个成员表达式
    // 1. 为每个唯一的访问路径生成标识符
    // 2. 收集成员访问器信息
    // 3. 替换原始表达式为新的访问方式
    arr.forEach((item) => {
      const { memberExprStart, nodePath, accessKey } = item;
      let key = accessorMap.get(accessKey);
      if (!key) {
        // 使用访问路径作为属性名，如 'a', 'c.name'
        key = accessKey.slice(1);
        accessorMap.set(accessKey, key);
        memberAccessors.push({
          node: t.cloneDeepWithoutLoc(memberExprStart!),
          key,
        });
      }

      // 替换原始的成员表达式为新的访问方式
      const isComputed = key.includes('.');
      nodePath!.replaceWith(
        t.memberExpression(
          t.cloneWithoutLoc(id),
          isComputed ? t.stringLiteral(key) : t.identifier(key),
          isComputed,
        ),
      );
    });

    if (!memberAccessors.length) {
      return;
    }
  }

  // 生成选择器函数
  // 创建一个新的函数，返回包含所有访问路径的对象
  const selectorName = path.scope.generateUidIdentifier('selector_');
  const selector = t.functionDeclaration(
    selectorName,
    [t.identifier(id.name)],
    t.blockStatement([
      t.returnStatement(
        t.objectExpression(
          memberAccessors.map((accessor) => {
            const isComputed = accessor.key.includes('.');
            const propKey = isComputed
              ? t.stringLiteral(accessor.key)
              : t.identifier(accessor.key);
            return t.objectProperty(propKey, accessor.node);
          }),
        ),
      ),
    ]),
  );
  // 将 selector 函数提升到组件外部，使其更持久化
  const funcParent =
    path.findParent(
      (p) =>
        p.isFunctionDeclaration() ||
        p.isFunctionExpression() ||
        p.isArrowFunctionExpression(),
    ) ?? path.parentPath;
  funcParent.insertBefore(selector);

  // 修改原始调用为 useShallowSnapshot
  callee.property.name = 'useShallowSnapshot';
  init.arguments = [selectorName];
}

type MemberAccessor = {
  node: MemberExpression | OptionalMemberExpression;
  key: string;
};

/**
 * 查找成员表达式链
 * 例如: a.b.c 会找到最后一个成员表达式 a.b.c
 *
 * @param path - 当前节点路径
 * @returns {
 *   memberExprStart - 成员表达式的起始节点
 *   nodePath - 当前节点路径
 *   accessKey - 完整的访问路径字符串
 * }
 */
function findMemberExpression(path: NodePath) {
  let current: NodePath | null = path;
  let memberExprStart: MemberAccessor['node'] | undefined;
  let accessKey = '';

  while (current?.parentPath) {
    const parent = current.parentPath;
    const node = parent.node;

    if (
      (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) &&
      t.isIdentifier(node.property)
    ) {
      memberExprStart = node;
      current = parent;
      accessKey += '.' + node.property.name;
    } else {
      break; // 如果不是成员表达式，立即停止向上查找
    }
  }

  return { memberExprStart, nodePath: current, accessKey };
}
