import BigNumber from "bignumber.js";
import { Format, RoundingMode } from "./shared";

export * from "./shared";

export function numbro(number: any) {
  return new Numbro(number);
}
numbro.RoundingMode = RoundingMode;

// 可以参与运算的参数
type OperationParams =
  | BigNumber
  | number
  | string
  | Numbro
  | undefined
  | null
  | boolean;

export class Numbro {
  static rawBigNumber = BigNumber;
  static RoundingMode = RoundingMode;
  static BN = BigNumber.clone({
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
  });
  bigNumber!: BigNumber;
  constructor(number: any) {
    this.bigNumber = this.castToBigNumber(number);
  }
  // 输入 强制转换为 BigNumber
  private castToBigNumber(other: OperationParams) {
    if (other instanceof Numbro) {
      other = other.bigNumber;
    }
    const res = new Numbro.BN(other as never);
    if (res.isNaN()) {
      return new Numbro.BN(0);
    }
    return res;
  }

  clone() {
    return new Numbro(this.bigNumber);
  }

  format(format: Format): string {
    let {
      output,
      thousandSeparated,
      roundingMode = BigNumber.ROUND_DOWN,
      postfix,
      mantissa,
      forceSign,
      average,
      ...rest
    } = format;

    const combinedFormat: BigNumber.Format = {
      suffix: postfix,
      groupSize: thousandSeparated ? 3 : 0,
      groupSeparator: thousandSeparated ? "," : "",
      decimalSeparator: ".",
      ...rest,
    };

    if (mantissa) {
      mantissa = Number(mantissa);
      if (Number.isNaN(mantissa)) {
        mantissa = undefined;
      }
    }

    let num = this.bigNumber;
    // 百分比
    if (output === "percent") {
      num = num.multipliedBy(100);
      combinedFormat.suffix = "%";
    }
    // 格式化成 1k, 1m, 1b, 1t
    if (average) {
      const average = this.computeAverage(num);
      if (average) {
        num = average.value;
        combinedFormat.suffix = average.suffix;
        // 没有指定小数位数，默认不保留小数
        if (!mantissa) {
          mantissa = 0;
        }
      }
    }

    let outputFormat = num.toFormat(
      mantissa as never,
      roundingMode as never,
      combinedFormat
    );

    // 强制显示正负号
    if (forceSign) {
      if (!num.eq(0)) {
        outputFormat = num.isPositive() ? `+${outputFormat}` : outputFormat;
      }
    }

    return outputFormat;
  }

  formatCurrency(
    format: Format & {
      /**
       * 货币符号，默认为 Rp
       * @default Rp
       */
      currencySymbol?: string;
    }
  ) {
    // TODO: 未来可以考虑支持多种货币符号
    const { currencySymbol = "Rp", ...rest } = format;
    return `${currencySymbol}${this.format(rest)}`;
  }

  private computeAverage(num: BigNumber) {
    const powers = {
      // 1t
      trillion: Math.pow(10, 12),
      // 1b
      billion: Math.pow(10, 9),
      // 1m
      million: Math.pow(10, 6),
      // 1k
      thousand: Math.pow(10, 3),
    };
    const config = [
      [powers.trillion, "t"],
      [powers.billion, "b"],
      [powers.million, "m"],
      [powers.thousand, "k"],
    ] as const;

    for (let i = 0; i < config.length; i++) {
      const [power, suffix] = config[i];
      if (num.gte(power)) {
        return {
          value: num.dividedBy(power),
          suffix,
        };
      }
    }
  }

  /**
   * 两个数的差值
   */
  difference(other: OperationParams): Numbro {
    const r = this.bigNumber.minus(this.castToBigNumber(other)).abs();
    return numbro(r);
  }

  /**
   * 两个数相加
   * @see https://mikemcl.github.io/bignumber.js/#plus
   */
  add(other: OperationParams): Numbro {
    const r = this.bigNumber.plus(this.castToBigNumber(other));
    return numbro(r);
  }

  /**
   * 两个数相减
   * @see https://mikemcl.github.io/bignumber.js/#minus
   */
  subtract(other: OperationParams): Numbro {
    const r = this.bigNumber.minus(this.castToBigNumber(other));
    return numbro(r);
  }

  /**
   * 两个数相乘
   * @see https://mikemcl.github.io/bignumber.js/#multipliedBy
   */
  multiply(other: OperationParams): Numbro {
    const r = this.bigNumber.multipliedBy(this.castToBigNumber(other));
    return numbro(r);
  }

  /**
   * 两个数相除
   * @see https://mikemcl.github.io/bignumber.js/#dividedBy
   */
  divide(other: OperationParams): Numbro {
    const r = this.bigNumber.dividedBy(this.castToBigNumber(other));
    return numbro(r);
  }

  /**
   * 转换为数字
   * @see https://mikemcl.github.io/bignumber.js/#toNumber
   */
  value(): number {
    return this.bigNumber.toNumber();
  }

  /**
   * 转换为数字
   */
  valueOf(): number {
    return this.bigNumber.toNumber();
  }
}