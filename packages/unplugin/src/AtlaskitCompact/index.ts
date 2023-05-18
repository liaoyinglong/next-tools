import { createUnplugin } from "unplugin";

/**
 * 兼容 Atlaskit design system 到 next 13 使用的插件
 */
export const AtlaskitCompactPlugin = createUnplugin((options: any) => {
  // 判断是否是在 node_modules/@atlaskit 下的文件
  const isShouldTransformReg = /@atlaskit/;

  // 判断是否包含 /** @jsx jsx */ 注释
  const isHasJsxCommentReg = /\/\*\*.*@jsx.+jsx.*\*\//;

  return {
    name: "atlaskitCompact",
    transformInclude(id) {
      return isShouldTransformReg.test(id);
    },
    transform(code) {
      let transformedCode = code;
      if (isHasJsxCommentReg.test(code)) {
        transformedCode = `/** @jsxRuntime classic */\n` + transformedCode;
      }
      return transformedCode;
    },
  };
});
