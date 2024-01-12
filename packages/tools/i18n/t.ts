import { type MessageDescriptor, type MessageOptions } from "@lingui/core";
import { i18n } from "./duneI18n";

/**
 * Translates a template string using the global I18n instance
 * @example
 * ```
 * const message = t`Hello ${name}`;
 * ```
 */
export let t = initT();
interface TFunction {
  (
    id: string,
    values?: Record<string, unknown>,
    options?: MessageOptions
  ): string;
  (descriptor: MessageDescriptor): string;
  (literals: TemplateStringsArray, ...placeholders: any[]): string;

  /**
   * 使用这个方法将被cli不会提取出来翻译
   * 一般用在key是后端返回的动态情况
   * 但是这种情况下需要开发者手动将翻译填入翻译文件中
   */
  ignoreExtract: TFunction;

  /**
   * 翻译后端错误信息
   *
   * 传入错误码，会补齐 `error_` 前缀
   * 传入对象，会使用对象的 code 字段去翻译, 如果没有对应的文案，则使用 message 字段返回
   */
  displayError: (
    arg:
      | number
      | string
      | {
          code?: string | number;
          message?: string | number;
          // 后端某些错误信息需要替换变量，这个字段用来传入变量
          errorVars?: Record<string, string>;
        }
  ) => string;
}

function initT() {
  let t = i18n.initT() as unknown as TFunction;
  t.ignoreExtract = t;
  t.displayError = (arg) => {
    let normalizedArg = typeof arg === "object" ? arg : { code: arg };

    let key = `error_${normalizedArg.code}`;
    const translated = t(key, normalizedArg.errorVars);
    // 如果没有对应的文案，则使用 message 字段返回
    if (translated === key && !!normalizedArg.message) {
      return normalizedArg.message + "";
    }
    return translated;
  };
  return t;
}
// 修复 更换语言的时候 t 没有重新生成，导致某些写在 useMemo 的 t 调用没有更新语言
i18n.on("change", () => {
  t = initT();
});
