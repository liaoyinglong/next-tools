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
export function handleVarDecl(path: NodePath<VariableDeclarator>) {
  const { id, init } = path.node;

  // pre check
  if (!t.isCallExpression(init) || !t.isIdentifier(id)) {
    return;
  }
  if (!t.isMemberExpression(init.callee)) {
    return;
  }

  // example: store.useSnapshot
  const callee = init.callee;
  if (!t.isIdentifier(callee.property)) {
    return;
  }
  if (callee.property.name !== "useSnapshot") {
    return;
  }

  const exprs: Item[] = [];
  {
    // 获取标识符的绑定信息
    // 只需要查找当前作用域的绑定信息
    const binding = path.scope.getOwnBinding(id.name);
    // 遍历所有引用
    binding?.referencePaths.forEach((refPath) => {
      const { lastValidExpr, nodePath } = findMemberExpression(refPath);
      if (lastValidExpr && nodePath) {
        const identifier = path.scope.generateUidIdentifier("$$zp_");
        exprs.push({
          node: t.cloneDeepWithoutLoc(lastValidExpr),
          identifier,
        });
        // 替换原来代码中的 a.b 为 $$zp_
        nodePath.replaceWith(t.cloneDeepWithoutLoc(identifier));
      }
    });
    if (!exprs.length) {
      // 没有引用
      return;
    }
  }

  // 生成选择器函数
  const selectorName = path.scope.generateUidIdentifier("$$zp_selector");
  const selector = t.functionDeclaration(
    selectorName,
    [t.identifier(id.name)],
    t.blockStatement([
      t.returnStatement(
        t.objectExpression(
          exprs.map((v) => {
            return t.objectProperty(v.identifier, v.node);
          }),
        ),
      ),
    ]),
  );
  path.parentPath.insertBefore(selector);

  // 更改为使用 useShallowSnapshot 方法
  callee.property.name = "useShallowSnapshot";
  // 将 selector
  init.arguments = [selectorName];
}

type Item = {
  node: MemberExpression | OptionalMemberExpression;
  identifier: Identifier;
};

// Helper function to find member expression
function findMemberExpression(path: NodePath) {
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

  return { lastValidExpr, nodePath: current };
}
