import type babel from '@babel/core';
import type { PluginObj } from '@babel/core';
import { handleIdentifierSnapshot } from './handleIdentifierSnapshot';
import { handleObjectPattern } from './handleObjectPattern';

export const createStorePlugin = (api: typeof babel): PluginObj => {
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
