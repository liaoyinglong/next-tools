import type babel from "@babel/core";
import type { PluginObj } from "@babel/core";
import { handleIdentifierSnapshot } from "./handleIdentifierSnapshot";

export const zustandPlugin = (api: typeof babel): PluginObj => {
  const { types: t } = api;

  return {
    name: "zustand",
    visitor: {
      VariableDeclarator(path) {
        handleIdentifierSnapshot(path);
      },
    },
  };
};
