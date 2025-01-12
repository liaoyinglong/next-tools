import type { NodePath } from "@babel/traverse";
import type {
  MemberExpression,
  OptionalMemberExpression,
  VariableDeclarator,
} from "@babel/types";
import t from "@babel/types";

type Item = MemberExpression | OptionalMemberExpression;

export function findRefProps(
  path: NodePath<VariableDeclarator>,
): Item[] | undefined {
  const { init, id } = path.node;

  if (!t.isIdentifier(id)) {
    return;
  }
  let res: Item[] = [];

  // 获取标识符的绑定信息
  const binding = path.scope.getBinding(id.name);
  // 遍历所有引用
  binding?.referencePaths.forEach((refPath) => {
    let item: Item | undefined;
    let cur: NodePath | null = refPath;

    while (cur) {
      const parent = cur.parentPath;
      const node = parent?.node;
      if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
        if (t.isIdentifier(node.property)) {
          item = node;
          cur = parent;
          continue;
        }
      }
      cur = null;
    }
    if (item) {
      res.push(t.cloneDeepWithoutLoc(item));
    }
  });

  return res;
}
