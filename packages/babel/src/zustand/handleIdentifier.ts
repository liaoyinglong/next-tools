import type { NodePath } from "@babel/traverse";
import type {
  Identifier,
  MemberExpression,
  OptionalMemberExpression,
  VariableDeclarator,
} from "@babel/types";
import t from "@babel/types";
/**
 * case: const a = store.useSnapshot()
 */
export function handleIdentifier(path: NodePath<VariableDeclarator>) {
  const exprs = findRefMemberExprs(path);
  if (!exprs?.length) {
    // 没有引用
    return;
  }
}

type Item = {
  node: MemberExpression | OptionalMemberExpression;
  identifier: Identifier;
};

/**
 * 找到变量声明中所有引用的成员表达式
 */
function findRefMemberExprs(
  path: NodePath<VariableDeclarator>,
): Item[] | undefined {
  const { id } = path.node;

  if (!t.isIdentifier(id)) {
    return;
  }
  let res: Item[] = [];

  // 获取标识符的绑定信息
  // 只需要查找当前作用域的绑定信息
  const binding = path.scope.getOwnBinding(id.name);
  // 遍历所有引用
  binding?.referencePaths.forEach((refPath) => {
    const memberExpr = findMemberExpression(refPath);
    if (memberExpr) {
      res.push({
        node: t.cloneDeepWithoutLoc(memberExpr),
        identifier: path.scope.generateUidIdentifier("$$zp_"),
      });
    }
  });

  return res;
}

// Helper function to find member expression
function findMemberExpression(path: NodePath): Item["node"] | undefined {
  let current: NodePath | null = path;
  let lastValidExpr: Item["node"] | undefined;

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
