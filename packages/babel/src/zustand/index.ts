import type babel from "@babel/core";
import type { PluginObj } from "@babel/core";
import { handleVarDecl } from "./handleVarDecl";

export const zustandPlugin = (api: typeof babel): PluginObj => {
  const { types: t } = api;

  return {
    name: "zustand",
    visitor: {
      VariableDeclarator(path) {
        handleVarDecl(path);
      },
    },
  };
};
