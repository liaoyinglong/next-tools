import BigNumber from "bignumber.js";

export interface Format extends BigNumber.Format {
  output?: "currency" | "percent" | "byte" | "time" | "ordinal" | "number";

  /**
   * 同 suffix 配置
   * @see BigNumber.Format.suffix
   */
  postfix?: string;
  average?: boolean;
  /**
   * 小数位数
   */
  mantissa?: number;
  /**
   * 是否显示千分位分割
   */
  thousandSeparated?: boolean;
  abbreviations?: {
    thousand?: string;
    million?: string;
    billion?: string;
    trillion?: string;
  };
  /**
   * 是否强制显示正负号
   * 0  -> 0
   * -1 -> -1
   * 1  -> +1
   */
  forceSign?: boolean;

  /**
   * 四舍五入模式
   * 默认为 BigNumber.ROUND_DOWN
   * @see BigNumber.RoundingMode
   */
  roundingMode?: BigNumber.RoundingMode;
}
