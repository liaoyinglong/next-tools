import BigNumber from "bignumber.js";
import { LocalesEnum } from "../i18n/enums";
import { defaultCurrencies } from "./currencies";
import type { CurrencyFormat, Format } from "./shared";
import { RoundingMode } from "./shared";

export * from "./shared";

// 可以参与运算的参数
type OperationParams =
  | BigNumber
  | number
  | string
  | Numbro
  | undefined
  | null
  | boolean
  | bigint
  | BigInt

export class Numbro {
  static rawBigNumber = BigNumber;
  static RoundingMode = RoundingMode;
  static BN = BigNumber.clone({
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
  });
  bigNumber: BigNumber;

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
    return res;
  }

  clone() {
    return new Numbro(this.bigNumber);
  }

  //#region number format
  /**
   * 默认的格式化配置
   */
  static defaultFormat: Format = {};
  static setDefaultFormat(format: Format) {
    Numbro.defaultFormat = format;
  }

  private combineFormatOptions(format: Format = {}): Format {
    return {
      ...Numbro.defaultFormat,
      ...format,
    };
  }

  format(format: Format = {}): string {
    format = this.combineFormatOptions(format);
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
      absoluteValue,
      ...rest
    } = format;
    let num = this.bigNumber;

    // NaN 的 fallback
    if (num.isNaN()) {
      if (NaNFormat) {
        return NaNFormat;
      }
      // 如果没有指定 NaNFormat，那么就当做 0 处理
      num = new Numbro.BN(0);
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

    // 在 currency format 中，需要使用绝对值来格式化
    let outputFormat = (absoluteValue ? num.abs() : num).toFormat(
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

  private getPrefixSign(forceSign: boolean | undefined) {
    // 如果是 NaN 或者 0，那么不显示正负号
    if (forceSign === false || this.bigNumber.isNaN() || this.bigNumber.eq(0)) {
      return "";
    }
    // 强制显示正负号
    if (forceSign) {
      return this.bigNumber.isPositive() ? "+" : "-";
    }
    // 如果没有指定 forceSign，那么需要判断是否小于 0
    return this.bigNumber.isPositive() ? "" : "-";
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
    // 是否强制显示正负号
    const sign = this.getPrefixSign(rest.forceSign);

    // TODO: 兼容之前的逻辑 后面会移除
    if (typeof currencySymbol !== "undefined") {
      symbol = currencySymbol;
    }
    let space = spaceSeparated ? " " : "";
    // 在 currency format 中，需要使用绝对值来格式化
    // 方便后续添加 正负号
    rest.absoluteValue = true;
    rest.forceSign = false;
    let formattedString = this.format(rest);

    //#region NaN 的 fallback
    const { NaNFormat } = this.combineFormatOptions(rest);
    if (formattedString === NaNFormat) {
      return formattedString;
    }
    //#endregion

    if (position === "prefix") {
      return `${sign}${symbol}${space}${formattedString}`;
    }
    return `${sign}${formattedString}${space}${symbol}`;
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
      // 移除无效 0 后，小数位数还比指定的小数位数多，那么就不用删除尾数 0
      shouldDeleteEndZero = !(clonedDecimal > (mantissa as number));
    }

    if (shouldDeleteEndZero) {
      // 移除尾数 0
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
    return this.valueOf();
  }

  /**
   * 转换为数字
   */
  valueOf(): number {
    if (this.bigNumber.isNaN()) {
      return 0;
    }
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
