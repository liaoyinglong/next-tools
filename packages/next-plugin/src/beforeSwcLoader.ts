import type { LoaderContext } from "webpack";

export interface BeforeSwcLoaderOptions {
  include?: RegExp[];
  /**
   * 是否自动加上 use client
   * @tips 对于 include 匹配的文件生效
   */
  enableAutoUseClient?: boolean;
  /**
   * 是否启用 emotion 的兼容 next 13 的 App Router 的代码
   * @tips 以上只对于 src 目录下的代码生效
   */
  enabledEmotionCompatForAppRouter?: boolean;
  /**
   * 是否启用 i18n 相代码的兼容，自动加上 use client
   * @tips 以上只对于 src 目录下的代码生效
   */
  enabledI18nCompat?: boolean;
}

// 判断是否包含 /** @jsx jsx */ 注释
const isHasJsxCommentReg = /\/\*\*.*@jsx.+jsx.*\*\//;

// 判断是否有 use client 指令
const hasUseClientReg = /['"]use client["']/;

// 判断是否在 src 目录下
const inSrcDirReg = /[\\\/]src[\\\/]/;

// case: /** @jsxImportSource @emotion/react */
const hasJsxImportSourceReg = /\/\*\*.*@jsxImportSource.*\*\//;
// case: css={{}} | styled.div``
const hasUseEmotionReg = /\scss=\{|\sstyled.*`/;
// case: useT()
const hasUseI18nReg = /useT\(\)/;

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
  if (shouldTransform && options.enableAutoUseClient) {
    transformedCode = appendUseClient(transformedCode);
  }

  const isInSrcDir = inSrcDirReg.test(this.resourcePath);
  const useEmotion = hasUseEmotionReg.test(source);
  if (isInSrcDir) {
    // 对应 src 中使用到了 emotion 的 css-in-js 的代码，需要加上 use client
    if (options.enabledEmotionCompatForAppRouter && useEmotion) {
      // 判断是否使用了 emotion 相关的代码
      if (!hasJsxImportSourceReg.test(source)) {
        transformedCode =
          `/** @jsxImportSource @emotion/react */\n` + transformedCode;
      }
    }

    // 对应 src 中使用到了 i18n 的代码，
    // 或者 使用 emotion 的代码
    // 需要加上 use client
    if (
      (options.enabledI18nCompat && hasUseI18nReg.test(source)) ||
      useEmotion
    ) {
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
