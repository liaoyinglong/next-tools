import type babel from "@babel/core";
import type { PluginObj } from "@babel/core";
import type {
  Expression,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  ObjectProperty,
  StringLiteral,
} from "@babel/types";

export const transPlugin = (api: typeof babel): PluginObj => {
  const { types: t } = api;

  const TransJSXIdent = t.jsxIdentifier("Trans");
  const idJSXIdent = t.jsxIdentifier("id");
  const messageJSXIdent = t.jsxIdentifier("message");
  const valuesJSXIdent = t.jsxIdentifier("values");
  const componentsJSXIdent = t.jsxIdentifier("components");

  return {
    name: "transPlugin",
    visitor: {
      JSXElement(path) {
        const { openingElement } = path.node;
        if (!t.isJSXIdentifier(openingElement.name, TransJSXIdent)) {
          // 不是 Trans 组件
          return;
        }
        let id = "";
        let userDefinedId = false;

        openingElement.attributes.forEach((attr) => {
          if (userDefinedId) {
            return;
          }
          if (
            !t.isJSXAttribute(attr) ||
            !t.isJSXIdentifier(attr.name, idJSXIdent)
          ) {
            // 不是 <Trans id="xxx" ></Trans>
            return;
          }
          let idExpr: StringLiteral | undefined;
          if (
            t.isJSXExpressionContainer(attr.value) &&
            t.isStringLiteral(attr.value.expression)
          ) {
            idExpr = attr.value.expression;
          } else if (t.isStringLiteral(attr.value)) {
            idExpr = attr.value;
          }

          if (!idExpr) {
            // 不支持 id 属性为变量 或者 模版字符串
            throw path.buildCodeFrameError(
              `Trans id attribute must be static string`,
              Error,
            );
          }
          id = idExpr.value;
          userDefinedId = true;
        });

        const { msg, vars, components } = workChildren(path.node.children, t);
        if (!userDefinedId) {
          // 外部没有指定 id，则使用从 children 中提取的文本
          id = msg;
        }

        // 清空 children，Trans 组件编译后没有 children
        path.node.children = [];
        // 添加 id props
        if (!userDefinedId) {
          openingElement.attributes.push(
            t.jsxAttribute(idJSXIdent, t.stringLiteral(id)),
          );
        }
        // 添加 message props
        if (id !== msg) {
          openingElement.attributes.push(
            t.jsxAttribute(messageJSXIdent, t.stringLiteral(msg)),
          );
        }
        // 添加 values props
        const valuesAttr = exprMapToJSXAttribute(valuesJSXIdent, vars, t);
        if (valuesAttr) {
          openingElement.attributes.push(valuesAttr);
        }
        // 添加 components props
        const componentsAttr = exprMapToJSXAttribute(
          componentsJSXIdent,
          components,
          t,
        );
        if (componentsAttr) {
          openingElement.attributes.push(componentsAttr);
        }
      },
    },
  };
};

function workChildren(
  children: JSXElement["children"],
  t: typeof babel.types,
  vars: Record<string, Expression> = {},
  components: Record<string, Expression> = {},
  i: number = 0,
) {
  let msg = "";
  let lastIndex = children.length - 1;
  children.forEach((child, index) => {
    if (t.isJSXText(child)) {
      // 开头 和 结尾 babel 都会包括回车，如果有的话
      const text = child.value
        // 换行 + 空格 开头
        .replace(/^\n\s*/, "")
        // 空格 + 换行 结尾
        .replace(/\s*\n$/, "")
        // 换行 + 空格 结尾
        .replace(/\n\s*$/, " ");
      msg += text;
      return;
    }
    if (t.isJSXExpressionContainer(child)) {
      if (t.isJSXEmptyExpression(child.expression)) {
        // 空表达式，直接忽略
        // case: <Trans>hello {}</Trans>
        return;
      }
      let varName = "";
      if (t.isIdentifier(child.expression)) {
        // 能获取到变量名的情况，用变量名，否则用索引
        // case: <Trans>hello {name}</Trans>
        varName = child.expression.name;
      } else {
        // 直接用 索引
        // case: <Trans>hello {user.name}</Trans>
        varName = i + "";
        i++;
      }
      vars[varName] = child.expression;
      msg += `{${varName}}`;
      return;
    }
    if (t.isJSXElement(child)) {
      if (child.children.length) {
        // case: <Trans>hello <a>world</a></Trans>
        // 中的 <a>world</a>
        msg += `<${i}>`;
        const { msg: childMsg, i: childI } = workChildren(
          child.children,
          t,
          vars,
          components,
          i + 1,
        );
        components[i] = child;
        msg += childMsg;
        msg += `</${i}>`;
        i = childI;
      } else {
        // case: <Trans>hello <br/> world</Trans>
        msg += `<${i}/>`;
        components[i] = child;
        i++;
      }
      return;
    }
  });

  return { msg, i, vars, components };
}

function exprMapToJSXAttribute(
  keyIdentifier: JSXIdentifier,
  exprMap: Record<string, Expression>,

  t: typeof babel.types,
): JSXAttribute | undefined {
  const props: ObjectProperty[] = [];
  Object.entries(exprMap).forEach(([key, value]) => {
    props.push(t.objectProperty(t.identifier(key), value));
  });
  if (props.length) {
    return t.jsxAttribute(
      keyIdentifier,
      t.jsxExpressionContainer(t.objectExpression(props)),
    );
  }
}
