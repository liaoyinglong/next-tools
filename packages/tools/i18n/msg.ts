//#region msg fn
import type { MessageDescriptor } from "@lingui/core";

interface MsgFn {
  (descriptor: MessageDescriptor): string;
  (id: string): string;
  (literals: TemplateStringsArray): string;
}

/**
 * @see https://lingui.dev/tutorials/react-patterns#lazy-translations
 * 标记需要提取的 i18n 字符串（用于提取翻译），主要给编译器用的
 * 一般用在以下场景：
 * 在组件外声明 options 需要翻译，组件外没有 t 函数
 * @example
 * ```jsx
 * const favoriteColors = [msg`Red`, msg`Orange`, msg`Yellow`, msg`Green`];
 * export default function ColorList() {
 *   const t = useT()
 *   return (
 *     <ul>
 *       {favoriteColors.map((color) => (
 *         <li>
 *           {t.ignoreExtract(color)}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export const msg: MsgFn = (...args: any[]) => {
  if (process.env.NODE_ENV !== "development") {
    if (args.length > 1) {
      throw new Error("msg函数只能接受字符串常量");
    }
  }
  return args[0];
};

//#endregion
