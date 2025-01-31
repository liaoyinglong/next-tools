import type { NodePath } from "@babel/traverse";
import type {
  Expression,
  Identifier,
  MemberExpression,
  OptionalMemberExpression,
  VariableDeclarator,
} from "@babel/types";
import t from "@babel/types";
import { handleSelectorArgument } from "./shared";
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
    callee.property.name !== "useSnapshot"
  ) {
    return;
  }

  // 如果已经有 selector 参数，则需要检查返回值类型
  if (init.arguments.length > 0) {
    if (handleSelectorArgument(init)) {
      callee.property.name = "useShallowSnapshot";
    }
    return;
  }

  const memberAccessors: MemberAccessor[] = [];
  const accessorMap = new Map<string, Identifier>();
  {
    const binding = path.scope.getOwnBinding(id.name);

    const arr: ReturnType<typeof findMemberExpression>[] = [];

    binding?.referencePaths.forEach((refPath) => {
      const { memberExprStart, nodePath, accessKey } =
        findMemberExpression(refPath);
      if (memberExprStart && nodePath && accessKey) {
        arr.push({ memberExprStart, nodePath, accessKey });
      }
    });

    if (!arr.length || arr.length !== binding?.referencePaths.length) {
      return;
    }

    binding?.referencePaths.forEach((refPath) => {
      const { memberExprStart, nodePath, accessKey } =
        findMemberExpression(refPath);
      if (memberExprStart && nodePath && accessKey) {
        let propIdentifier = accessorMap.get(accessKey);
        if (!propIdentifier) {
          propIdentifier = path.scope.generateUidIdentifier("prop_");
          accessorMap.set(accessKey, propIdentifier);
          memberAccessors.push({
            node: t.cloneDeepWithoutLoc(memberExprStart),
            identifier: propIdentifier,
          });
        }

        nodePath.replaceWith(
          t.memberExpression(
            t.cloneWithoutLoc(id),
            t.cloneDeepWithoutLoc(propIdentifier),
          ),
        );
      }
    });
    if (!memberAccessors.length) {
      return;
    }
  }

  // 生成选择器函数
  const selectorName = path.scope.generateUidIdentifier("selector_");
  const selector = t.functionDeclaration(
    selectorName,
    [t.identifier(id.name)],
    t.blockStatement([
      t.returnStatement(
        t.objectExpression(
          memberAccessors.map((accessor) => {
            return t.objectProperty(accessor.identifier, accessor.node);
          }),
        ),
      ),
    ]),
  );
  path.parentPath.insertBefore(selector);

  // 修改为使用 useShallowSnapshot 并传入选择器
  callee.property.name = "useShallowSnapshot";
  init.arguments = [selectorName];
}

type MemberAccessor = {
  node: MemberExpression | OptionalMemberExpression;
  identifier: Identifier;
};

/**
 * 查找成员表达式链
 * 例如: a.b.c 会找到最后一个成员表达式 a.b.c
 */
function findMemberExpression(path: NodePath) {
  let current: NodePath | null = path;
  let memberExprStart: MemberAccessor["node"] | undefined;
  let accessKey = "";

  while (current?.parentPath) {
    const parent = current.parentPath;
    const node = parent.node;
    accessKey += node.name;

    if (
      (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) &&
      t.isIdentifier(node.property)
    ) {
      memberExprStart = node;
      current = parent;
      accessKey += "." + node.property.name;
    } else {
      break; // 如果不是成员表达式，立即停止向上查找
    }
  }

  return { memberExprStart, nodePath: current, accessKey };
}

// 辅助函数：生成成员访问路径的唯一标识
function getMemberExpressionKey(expr: Expression): string {
  if (t.isMemberExpression(expr)) {
    const propKey = t.isIdentifier(expr.property)
      ? expr.property.name
      : (expr.property as any).value;
    return getMemberExpressionKey(expr.object) + "." + propKey;
  }
  if (t.isOptionalMemberExpression(expr)) {
    const propKey = t.isIdentifier(expr.property)
      ? expr.property.name
      : (expr.property as any).value;
    return getMemberExpressionKey(expr.object) + "?." + propKey;
  }
  if (t.isIdentifier(expr)) {
    return expr.name;
  }
  // 其他类型的表达式，返回一个固定标识
  return "_";
}
