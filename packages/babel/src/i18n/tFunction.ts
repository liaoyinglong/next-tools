import type babel from "@babel/core";
import type { PluginObj } from "@babel/core";
import type { Expression } from "@babel/types";

export const tFunctionPlugin = (api: typeof babel): PluginObj => {
  const { types: t } = api;
  type Types = typeof t;

  const tFunction = t.identifier("t");

  return {
    name: "tFunctionPlugin",
    visitor: {
      TaggedTemplateExpression(path) {
        const { tag, quasi } = path.node;
        if (tag.type !== "Identifier" || tag.name !== "t") {
          // not t function
          return;
        }
        const { quasis, expressions } = quasi;
        let id = "";
        let slots: Record<string, Expression> = {};
        let hasSlots = false;

        quasis.forEach((v, i) => {
          id += v.value.raw;
          const exp = expressions[i];
          if (t.isExpression(exp)) {
            // 能获取到变量名的情况，用变量名，否则用索引
            // t`Refresh inbox ${name}` => name
            // t`Refresh inbox ${obj.name}` => 0
            const varName = t.isIdentifier(exp) ? exp.name : i;
            id += `{${varName}}`;
            slots[varName] = exp;
            hasSlots = true;
          }
        });

        // 组装新
        // t(id,{ [key]: value })
        const args: Expression[] = [t.stringLiteral(id)];
        if (hasSlots) {
          const slotsObj = t.objectExpression(
            Object.entries(slots).map(([key, value]) => {
              return t.objectProperty(t.identifier(key), value);
            }),
          );
          args.push(slotsObj);
        }
        path.replaceWith(t.callExpression(tFunction, args));
      },
    },
  };
};
