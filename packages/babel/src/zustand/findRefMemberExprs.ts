import type { NodePath } from "@babel/traverse";
import type {
  MemberExpression,
  OptionalMemberExpression,
  VariableDeclarator,
} from "@babel/types";
import t from "@babel/types";

type Item = MemberExpression | OptionalMemberExpression;

/**
 * 找到变量声明中所有引用的成员表达式
 */
export function findRefMemberExprs(
  path: NodePath<VariableDeclarator>,
): Item[] | undefined {
  const { id } = path.node;

  if (!t.isIdentifier(id)) {
    return;
  }
  let res: Item[] = [];

  // 获取标识符的绑定信息
  const binding = path.scope.getBinding(id.name);
  // 遍历所有引用
  binding?.referencePaths.forEach((refPath) => {
    const memberExpr = findMemberExpression(refPath);
    if (memberExpr) {
      res.push(t.cloneDeepWithoutLoc(memberExpr));
    }
  });

  return res;
}

// Helper function to find member expression
function findMemberExpression(path: NodePath): Item | undefined {
  let current: NodePath | null = path;
  let lastValidExpr: Item | undefined;

  while (current?.parentPath) {
    const parent = current.parentPath;
    const node = parent.node;

    if (
      (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) &&
      t.isIdentifier(node.property)
    ) {
      lastValidExpr = node;
      current = parent;
    } else {
      break; // 如果不是成员表达式，立即停止向上查找
    }
  }

  return lastValidExpr;
}
