import type babel from "@babel/core";
import type { PluginObj } from "@babel/core";

/**
 * 用来修复一些 react compiler 暂时不支持的 feature
 * see tests/react-compiler/fixtures
 */
export const fixReactCompilerPlugin = (api: typeof babel): PluginObj => {
  const { types: t } = api;

  return {
    name: "fixReactCompilerPlugin",
    visitor: {},
  };
};
