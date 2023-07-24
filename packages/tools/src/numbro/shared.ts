import BigNumber from "bignumber.js";
import { LocalesEnum } from "../i18n";

export interface Format extends BigNumber.Format {
  output?: "percent";

  /**
   * 同 suffix 配置
   * @see BigNumber.Format.suffix
   */
  postfix?: string;
  average?: boolean;
  /**
   * 小数位数
   */
  mantissa?: number | string | null | undefined;
  /**
   * 是否显示千分位分割
   */
  thousandSeparated?: boolean;
  /**
   * 是否强制显示正负号
   * 0  -> 0
   * -1 -> -1
   * 1  -> +1
   */
  forceSign?: boolean;

  /**
   * 四舍五入模式
   * 默认为  RoundingMode.RoundDown
   * @see RoundingMode
   */
  roundingMode?: RoundingMode;

  /**
   * 先去除原始数字的尾数0
   * - 删除尾数0后的精度 > 将要格式化的精度
   *   - 保留按照精度格式化后的尾数0
   * - 删除尾数0后的精度 <= 将要格式化的精度
   *   - 删除按照精度格式化后的尾数0
   * 例如：
   * - 1.0000 保留2位小数后 => 1
   * - 1.2000 保留2位小数后 => 1.2
   * - 1.2010 保留2位小数后 => 1.20 (去除原始数字的尾数0后是 1.201 , 当前精度3大于将要格式化的精度2，尾数0有效)
   * - 1.2001 保留2位小数后 => 1.20 (去除原始数字的尾数0后是 1.2001, 当前精度4大于将要格式化的精度2，尾数0有效)
   */
  deleteInvalidZero?: boolean;

  /**
   * 是否删除尾数0
   * 跟 deleteInvalidZero 不同的是，这个是按照精度格式化完成后，再去删除所有尾数0
   * 例如：
   * - 1.0000 保留2位小数后 => 1
   * - 1.2000 保留2位小数后 => 1.2
   * - 1.2010 保留2位小数后 => 1.2 (不会管初始数字，直接移除格式化后的数字尾数0)
   * - 1.2001 保留2位小数后 => 1.2 (不会管初始数字，直接移除格式化后的数字尾数0)
   */
  deleteEndZero?: boolean;
}

export interface CurrencyFormat extends Format {
  /**
   * 货币符号
   * @deprecated 请使用 symbol
   */
  currencySymbol?: string;
  /**
   * 货币符号
   */
  symbol?: string;

  /**
   * 货币符号位置
   */
  position?: "prefix" | "postfix";

  /**
   * 按哪种语言格式化，会根据传入的语言去 currencies 里获取对应的配置项
   * 一般用在以下情况：
   * - 当前设置的语言是 en，但是需要格式化成 id 的货币
   */
  locale?: LocalesEnum | (string & {});

  /**
   * symbol 和 数字 之间是否需要空格
   */
  spaceSeparated?: boolean;
}

/**
 * 重新导出 BigNumber.RoundingMode
 * 由于项目不会使用太多的四舍五入模式，所以只导出常用的几个
 * @see BigNumber.RoundingMode
 */
export enum RoundingMode {
  RoundDown = BigNumber.ROUND_DOWN,
  RoundFloor = BigNumber.ROUND_FLOOR,
  RoundUp = BigNumber.ROUND_UP,
  RoundCeil = BigNumber.ROUND_CEIL,
  RoundHalfUp = BigNumber.ROUND_HALF_UP,
}
