import BigNumber from "bignumber.js";

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
