import type { LoaderContext } from "webpack";

export interface BeforeSwcLoaderOptions {
  include?: RegExp[];
  /**
   * 是否自动加上 use client
   */
  enableAutoUseClient?: boolean;
  /**
   * 是否启用 emotion 的兼容 next 13 的 App Router 的代码
   * 这里将会默认转换 src 目录下的 emotion 代码兼容
   */
  enabledEmotionCompatForAppRouter?: boolean;
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
  const isHasUseClient = hasUseClientReg.test(source);

  //#region  atlaskit 兼容 next 13
  if (isHasJsxCommentReg.test(source)) {
    transformedCode = `/** @jsxRuntime classic */\n` + transformedCode;
  }
  //#endregion

  // 没有 use client 开头的，需要加上
  if (shouldTransform && !isHasUseClient && options.enableAutoUseClient) {
    transformedCode = `'use client';\n` + transformedCode;
  }

  // 对应 src 中使用到了 emotion 的 css-in-js 的代码，需要加上 use client
  if (
    options.enabledEmotionCompatForAppRouter &&
    inSrcDirReg.test(this.resourcePath)
  ) {
    // 判断是否使用了 emotion 相关的代码
    if (hasUseEmotionReg.test(source)) {
      if (!hasJsxImportSourceReg.test(source)) {
        transformedCode =
          `/** @jsxImportSource @emotion/react */\n` + transformedCode;
      }
      if (!isHasUseClient) {
        transformedCode = `'use client';\n` + transformedCode;
      }
    }
  }

  return callback(null, transformedCode, sourceMap);
}
