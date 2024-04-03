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

  /**
   * 是否是 [locale] 模式 route 的项目
   * 目前 i18n 的 useT 已经支持在 rsc 中使用
   * 即：在页面中只是用 useT() 时，可以不用添加 "use client"
   */
  enableI18nRoute?: boolean;
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
  if (isInSrcDir && !shouldAddUseClient) {
    // 使用 emotion 的代码
    shouldAddUseClient =
      options.enableEmotionUseClient && hasUseEmotionReg.test(source);
    if (!shouldAddUseClient) {
      // 使用 hooks 的代码
      // 在 i18n 路由模式下，不需要检测 useT 的调用，这里直接去掉
      // 假设去掉只会还检测出 useX 开头的钩子，则添加 "use client"
      const toCheckHooksCode = options.enableI18nRoute
        ? source.replace(/useT\(\)/g, "")
        : source;

      shouldAddUseClient = hasUseHooksReg.test(toCheckHooksCode);
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
