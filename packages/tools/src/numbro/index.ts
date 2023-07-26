import BigNumber from "bignumber.js";
import { LocalesEnum } from "../i18n";
import { defaultCurrencies } from "./currencies";
import { CurrencyFormat, Format, RoundingMode } from "./shared";

export * from "./shared";

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

  /**
   * 初始值是否是 NaN
   * 主要场景是给 format 的时候需要判断
   * 原始值如果是NaN，那么 format 后，
   * 按目前业务场景应该是显示 '-' ,而不能是 0
   * 另外需要支持配置为任意
   */
  private rawValueIsNan = false;

  constructor(number: any) {
    this.bigNumber = this.castToBigNumber(number);
  }
  // 输入 强制转换为 BigNumber
  private castToBigNumber(other: OperationParams) {
    if (other instanceof Numbro) {
      other = other.bigNumber;
    }
    if (typeof other === "string") {
      // case: "1,000" => "1000"
      other = other.trim().replace(/,/g, "");
    }

    const res = new Numbro.BN(other as never);
    if (res.isNaN()) {
      this.rawValueIsNan = true;
      return new Numbro.BN(0);
    }
    return res;
  }

  clone() {
    return new Numbro(this.bigNumber);
  }

  //#region number format
  /**
   * 默认的格式化配置
   */
  static defaultFormat: Format = {
    thousandSeparated: true,
  };
  static setDefaultFormat(format: Format) {
    Numbro.defaultFormat = format;
  }
  format(format: Format = {}): string {
    format = {
      ...Numbro.defaultFormat,
      ...format,
    };
    let {
      output,
      thousandSeparated,
      roundingMode = BigNumber.ROUND_DOWN,
      postfix,
      mantissa,
      forceSign,
      average,
      deleteInvalidZero,
      deleteEndZero,
      NaNFormat,
      ...rest
    } = format;
    // 如果原始值是 NaN，那么直接返回 NaNFormat
    if (this.rawValueIsNan && NaNFormat) {
      return NaNFormat;
    }

    const combinedFormat: BigNumber.Format = {
      suffix: postfix,
      groupSize: thousandSeparated ? 3 : 0,
      groupSeparator: thousandSeparated ? "," : "",
      decimalSeparator: ".",
      ...rest,
    };

    if (mantissa || Number.isNaN(mantissa)) {
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

    outputFormat = this.tryDeleteEndZero(
      deleteEndZero,
      deleteInvalidZero,
      mantissa,
      outputFormat,
      combinedFormat.suffix
    );

    // 强制显示正负号
    if (forceSign) {
      if (!num.eq(0)) {
        outputFormat = num.isPositive() ? `+${outputFormat}` : outputFormat;
      }
    }

    return outputFormat;
  }
  //#endregion

  //#region  currency format
  /**
   * currency format default
   */
  static locale: string = LocalesEnum.id;
  static setLocale(locale: string) {
    // check locale is valid
    if (!(locale in Numbro.defaultCurrencies)) {
      throw new Error(`在 defaultCurrencies 中，找不到 ${locale}，请先检查`);
    }
    Numbro.locale = locale;
  }

  /**
   * 默认的货币格式化配置
   * key: locale
   * value: currency format
   */
  static defaultCurrencies = defaultCurrencies;
  static setDefaultCurrencies(currencies: typeof defaultCurrencies) {
    Numbro.defaultCurrencies = currencies;
  }
  formatCurrency(format: CurrencyFormat = {}) {
    // 根据语言解析出来的默认格式
    const defaultCurrencyFormat =
      Numbro.defaultCurrencies[format.locale ?? Numbro.locale];

    format = {
      ...defaultCurrencyFormat,
      ...format,
    };
    let {
      position = "prefix",
      currencySymbol,
      symbol,
      spaceSeparated,

      ...rest
    } = format;
    symbol ??= currencySymbol;
    let space = spaceSeparated ? " " : "";
    let formattedString = this.format(rest);
    if (position === "prefix") {
      return `${symbol}${space}${formattedString}`;
    }
    return `${formattedString}${space}${symbol}`;
  }
  //#endregion

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
      [powers.trillion, "T"],
      [powers.billion, "B"],
      [powers.million, "M"],
      [powers.thousand, "K"],
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

  private tryDeleteEndZero(
    deleteEndZero: boolean | undefined,
    deleteInvalidZero: boolean | undefined,
    mantissa: number | undefined | null | string,
    outputFormat: string,
    suffix = ""
  ) {
    const num = this.bigNumber;
    let shouldDeleteEndZero = false;
    if (deleteEndZero) {
      shouldDeleteEndZero = true;
    } else if (deleteInvalidZero && mantissa) {
      // 先转成数字 移除无效0
      // case: 1.00100 => 1.001
      let cloned = num.toString();
      let clonedDecimal = cloned.split(".")[1]?.length ?? 0;
      // 移除无效0后，小数位数还比指定的小数位数多，那么就不用删除尾数0
      shouldDeleteEndZero = !(clonedDecimal > (mantissa as number));
    }

    if (shouldDeleteEndZero) {
      // 移除尾数0
      // outputFormat = outputFormat.replace(/\.?0+$/, "");
      const reg = new RegExp(`\\.?0+${suffix}$`);
      outputFormat = outputFormat.replace(reg, suffix);
    }
    return outputFormat;
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

  toString() {
    return this.bigNumber.toString();
  }
}

export function numbro(number: any) {
  return new Numbro(number);
}
numbro.RoundingMode = RoundingMode;
