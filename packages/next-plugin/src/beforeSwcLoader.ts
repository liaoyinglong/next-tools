import type { LoaderContext } from "webpack";

export interface BeforeSwcLoaderOptions {
  include?: RegExp[];
}

// 判断是否包含 /** @jsx jsx */ 注释
const isHasJsxCommentReg = /\/\*\*.*@jsx.+jsx.*\*\//;

// 判断是否是以 use client 开头
const isStartWithUseClient = /^['"]use client["']/;
// 判断是否是在 atlaskit design system

export default function beforeSwcLoader(
  this: LoaderContext<BeforeSwcLoaderOptions>,
  source: string,
  sourceMap: any
) {
  const callback = this.async();
  const options = this.getOptions();
  let transformedCode = source;

  const shouldTransform = options.include.some((reg) => {
    return reg.test(this.resourcePath);
  });

  //#region  atlaskit 兼容 next 13
  if (isHasJsxCommentReg.test(source)) {
    transformedCode = `/** @jsxRuntime classic */\n` + transformedCode;
  }
  //#endregion

  // 没有 use client 开头的，需要加上
  if (shouldTransform && !isStartWithUseClient.test(source)) {
    transformedCode = `'use client';\n` + transformedCode;
  }

  return callback(null, transformedCode, sourceMap);
}
