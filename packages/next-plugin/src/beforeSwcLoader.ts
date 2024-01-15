import type { LoaderContext } from "webpack";

export interface BeforeSwcLoaderOptions {
  include?: RegExp[];
  /**
   * 是否自动加上 use client
   * @tips 对于 include 匹配的文件生效
   */
  enableAutoUseClient?: boolean;
}

// 判断是否包含 /** @jsx jsx */ 注释
const isHasJsxCommentReg = /\/\*\*.*@jsx.+jsx.*\*\//;

// 判断是否有 use client 指令
const hasUseClientReg = /['"]use client["']/;

// 判断是否在 src 目录下
const inSrcDirReg = /[\\\/]src[\\\/]/;

// case: css={{}} | styled.div``
const hasUseEmotionReg = /\scss=\{|\sstyled.*`/;

// case: use hooks
const hasUseHooksReg = /use[A-Z][a-zA-Z0-9]*\([^)]*\)/;

export default function beforeSwcLoader(
  this: LoaderContext<BeforeSwcLoaderOptions>,
  source: string,
  sourceMap: any
) {
  const callback = this.async();
  const options = this.getOptions();
  let transformedCode = source;

  const shouldTransform = options.include?.some((reg) => {
    return reg.test(this.resourcePath);
  });

  //#region  atlaskit 兼容 next 13
  if (isHasJsxCommentReg.test(source)) {
    transformedCode = `/** @jsxRuntime classic */\n` + transformedCode;
  }
  //#endregion

  // 没有 use client 开头的，需要加上
  if (shouldTransform && options.enableAutoUseClient) {
    transformedCode = appendUseClient(transformedCode);
  }

  const isInSrcDir = inSrcDirReg.test(this.resourcePath);
  if (isInSrcDir) {
    // 使用 emotion 的代码
    const useEmotion = hasUseEmotionReg.test(source);
    // 使用 hooks 的代码
    const useHooks = hasUseHooksReg.test(source);
    if (useEmotion || useHooks) {
      transformedCode = appendUseClient(transformedCode);
    }
  }

  return callback(null, transformedCode, sourceMap);
}

/**
 * 添加 use client
 * 如果有 use client 则不添加
 */
function appendUseClient(code: string) {
  if (hasUseClientReg.test(code)) {
    return code;
  }
  return `'use client';\n` + code;
}
