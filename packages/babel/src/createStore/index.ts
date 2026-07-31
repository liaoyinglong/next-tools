import type { PluginAPI, PluginObject } from '@babel/core';
import { handleIdentifierSnapshot } from './handleIdentifierSnapshot';
import { handleObjectPattern } from './handleObjectPattern';

export const createStorePlugin = (api: PluginAPI): PluginObject => {
  return {
    name: 'create-store',
    visitor: {
      VariableDeclarator(path) {
        handleIdentifierSnapshot(path);
        handleObjectPattern(path);
      },
    },
  };
};
