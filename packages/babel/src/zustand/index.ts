import type babel from "@babel/core";
import type { PluginObj } from "@babel/core";
import { isNeedTransform } from "./shared";

export const zustandPlugin = (api: typeof babel): PluginObj => {
  const { types: t } = api;

  return {
    name: "zustand",
    visitor: {
      VariableDeclarator(path) {
        const { init, id } = path.node;
        if (!isNeedTransform(init)) {
          return;
        }

        if (t.isIdentifier(id)) {
          id;
          //  case: const a = store.useSnapshot()
        }
      },
    },
  };
};
