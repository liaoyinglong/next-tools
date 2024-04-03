import type { LoaderContext } from "webpack";

export interface BeforeSwcLoaderOptions {
  include?: RegExp[];
  /**
   * 是否自动加上 use client
   * @tips 对于 include 匹配的文件生效
   */
  enableAutoUseClient?: boolean;
  /**
   * 是否需要匹配 emotion 的代码，只对 src 目录下的文件生效
   * case: css={{}} | styled.div`` | styled.div(Component)``
   */
  enableEmotionUseClient?: boolean;
}

// 判断是否有 use client 指令
const hasUseDirectiveReg = /['"]use (client|server)["']/;

// 判断是否在 src 目录下
const inSrcDirReg = /[\\\/]src[\\\/]|@dune2[\\\/]tools/;

// case: css={{}} | styled.div`` | styled.div(Component)``
const hasUseEmotionReg = /\scss=\{|\sstyled.*`|styled.*\(.+\)`/;

// case: use hooks
const hasUseHooksReg = /use[A-Z][a-zA-Z0-9]*\([^)]*\)/;

export default function beforeSwcLoader(
  this: LoaderContext<BeforeSwcLoaderOptions>,
  source: string,
  sourceMap: any,
) {
  const callback = this.async();
  const options = this.getOptions();
  let shouldAddUseClient = false;

  const shouldTransform = options.include?.some((reg) => {
    return reg.test(this.resourcePath);
  });

  // 没有 use client 开头的，需要加上
  if (shouldTransform && options.enableAutoUseClient) {
    shouldAddUseClient = true;
  }

  const isInSrcDir = inSrcDirReg.test(this.resourcePath);
  if (isInSrcDir) {
    // 使用 emotion 的代码
    const useEmotion =
      options.enableEmotionUseClient && hasUseEmotionReg.test(source);
    // 使用 hooks 的代码
    const useHooks = hasUseHooksReg.test(source);
    if (useEmotion || useHooks) {
      shouldAddUseClient = true;
    }
  }

  if (shouldAddUseClient) {
    // 判断是否有 use client ｜ use server，如果没有则加上
    const hasDirective = hasUseDirectiveReg.test(source);
    if (!hasDirective) {
      source = `'use client';\n` + source;
    }
  }

  return callback(null, source, sourceMap);
}
