import BigNumber from "bignumber.js";
import { beforeEach, describe, expect, it } from "vitest";
import { LocalesEnum } from "../../i18n";
import { Numbro, numbro } from "../../numbro";

//#region reset to default format
const defaultCurrencies = Numbro.defaultCurrencies;
beforeEach(() => {
  Numbro.setDefaultFormat({
    thousandSeparated: true,
  });
  Numbro.setDefaultCurrencies(defaultCurrencies);
  Numbro.setLocale(LocalesEnum.id);
});
//#endregion

describe("numbro", () => {
  it("normalizeInput", () => {
    [
      [1, 1],
      ["", NaN],
      [null, NaN],
      [undefined, NaN],
      [NaN, NaN],
      [false, NaN],
      [Infinity, Infinity],
      [-Infinity, -Infinity],

      ["1,000", 1000],
      ["1,000.000", 1000],

      [100n, 100],
    ].forEach(([input, output]) => {
      expect(numbro(input).bigNumber).toEqual(new BigNumber(output as never));
    });
  });

  it("default format", function () {
    expect(numbro("1.230000").format()).toEqual("1.23");
    expect(numbro("1234.230000").format()).toEqual("1,234.23");
    expect(numbro(0).format()).toEqual("0");
    expect(numbro(+0).format()).toEqual("0");
    expect(numbro(-0).format()).toEqual("0");
    expect(numbro("0.00").format()).toEqual("0");
    expect(numbro(null).format()).toEqual("0");
    expect(numbro(undefined).format()).toEqual("0");
    expect(numbro(NaN).format()).toEqual("0");

    expect(numbro("1.230000").toString()).toEqual("1.23");
    expect(numbro("1234.230000").toString()).toEqual("1234.23");
  });

  it("运算之后为 NaN 时的 format", () => {
    expect(numbro(1).add(null).format()).toBe("0");
    expect(numbro(1).subtract(null).format()).toBe("0");
    expect(numbro(1).difference(null).format()).toBe("0");
    expect(numbro(1).multiply(null).format()).toBe("0");
    expect(numbro(1).divide(null).format()).toBe("0");

    let NaNFormat = "N/A";
    expect(numbro(1).add(null).format({ NaNFormat })).toBe(NaNFormat);
    expect(numbro(1).subtract(null).format({ NaNFormat })).toBe(NaNFormat);
    expect(numbro(1).difference(null).format({ NaNFormat })).toBe(NaNFormat);
    expect(numbro(1).multiply(null).format({ NaNFormat })).toBe(NaNFormat);
    expect(numbro(1).divide(null).format({ NaNFormat })).toBe(NaNFormat);

    // with set default NaNFormat
    Numbro.setDefaultFormat({
      NaNFormat,
    });
    expect(numbro(1).add(null).format()).toBe(NaNFormat);
    expect(numbro(1).subtract(null).format()).toBe(NaNFormat);
    expect(numbro(1).difference(null).format()).toBe(NaNFormat);
    expect(numbro(1).multiply(null).format()).toBe(NaNFormat);
    expect(numbro(1).divide(null).format()).toBe(NaNFormat);
  });

  it("deleteInvalidZero 支持 删除尾数 0", function () {
    [
      ["1.000000", 2, "1"],
      ["1.000000", 3, "1"],
      ["1.000000", 4, "1"],

      ["1.200001", 2, "1.20"],
      ["1.200001", 3, "1.200"],
      ["1.200001", 4, "1.2000"],

      ["1.200010", 2, "1.20"],
      ["1.200010", 3, "1.200"],
      ["1.200010", 4, "1.2000"],

      ["0.1234567800000", 2, "0.12"],
      ["0.1234567800000", 3, "0.123"],
      ["0.1234567800000", 4, "0.1234"],
    ].forEach(([input, mantissa, output]) => {
      expect(
        numbro(input).format({ mantissa, deleteInvalidZero: true }),
      ).toEqual(output);
    });

    [
      ["0.1000000", 2, "10%"],
      ["0.1000001", 2, "10.00%"],
      ["0.1000001", 3, "10.000%"],
      ["0.1000010", 2, "10.00%"],
      ["0.1000010", 3, "10.000%"],
    ].forEach(([input, mantissa, output]) => {
      expect(
        numbro(input).format({
          mantissa,
          deleteInvalidZero: true,
          output: "percent",
        }),
      ).toEqual(output);
    });

    expect(
      numbro("-0.0112").format({
        mantissa: 2,
        output: "percent",
      }),
    ).toEqual("-1.12%");

    [
      ["1.000000", 2, "1 BTC"],
      ["1.000001", 2, "1.00 BTC"],
      ["1.000001", 3, "1.000 BTC"],
      ["1.000010", 2, "1.00 BTC"],
      ["1.000010", 3, "1.000 BTC"],
    ].forEach(([input, mantissa, output]) => {
      expect(
        numbro(input).format({
          mantissa,
          deleteInvalidZero: true,
          suffix: " BTC",
        }),
      ).toEqual(output);
    });
  });

  it("deleteEndZero 支持 删除尾数 0", function () {
    [
      ["1.000000", 2, "1"],
      ["1.000000", 3, "1"],
      ["1.000000", 4, "1"],

      ["1.200001", 2, "1.2"],
      ["1.200001", 3, "1.2"],
      ["1.200001", 4, "1.2"],

      ["1.230000", 2, "1.23"],
      ["1.230000", 3, "1.23"],
      ["1.230000", 4, "1.23"],

      ["0.1234567800000", 2, "0.12"],
      ["0.1234567800000", 3, "0.123"],
      ["0.1234567800000", 4, "0.1234"],
    ].forEach(([input, mantissa, output]) => {
      expect(numbro(input).format({ mantissa, deleteEndZero: true })).toEqual(
        output,
      );
    });

    [
      ["0.1000000", 2, "10%"],
      ["0.1000001", 2, "10%"],
      ["0.1000001", 3, "10%"],
    ].forEach(([input, mantissa, output]) => {
      expect(
        numbro(input).format({
          mantissa,
          deleteEndZero: true,
          output: "percent",
        }),
      ).toEqual(output);
    });

    [
      ["1.000000", 2, "1 BTC"],
      ["1.000001", 2, "1 BTC"],
      ["1.000001", 3, "1 BTC"],
    ].forEach(([input, mantissa, output]) => {
      expect(
        numbro(input).format({
          mantissa,
          deleteEndZero: true,
          suffix: " BTC",
        }),
      ).toEqual(output);
    });
  });

  it("格式化不丢失精度", function () {
    const a = [
      [1, 2, "1.00"],
      [1.1, 2, "1.10"],
      [1000, 2, "1,000.00"],
      ["24411725.000021970552501575", 18, "24,411,725.000021970552501575"],
      ["24411725.000021970552501575", 8, "24,411,725.00002197"],
      ["2131232131231232312312", 2, "2,131,232,131,231,232,312,312.00"],
      [10000000000000000000000n, 2, "10,000,000,000,000,000,000,000.00"],
    ] as const;
    a.forEach(([num, precision, output]) => {
      expect(numbro(num).format({ mantissa: precision })).toEqual(output);
    });
  });

  it("forceSign correct", function () {
    [
      [1, "+1"],
      [0, "0"],
      [-0, "0"],
      [-1, "-1"],
    ].forEach(([input, output]) => {
      expect(numbro(input).format({ forceSign: true })).toEqual(output);
    });
  });

  it("roundingMode correct", function () {
    const instance = numbro(1.23456789);
    (
      [
        [numbro.RoundingMode.RoundDown, 2, "1.23"],
        [numbro.RoundingMode.RoundFloor, 2, "1.23"],
        [numbro.RoundingMode.RoundUp, 2, "1.24"],
        [numbro.RoundingMode.RoundCeil, 2, "1.24"],
        [numbro.RoundingMode.RoundHalfUp, 2, "1.23"],
        // ------------------------------
        [numbro.RoundingMode.RoundDown, 3, "1.234"],
        [numbro.RoundingMode.RoundFloor, 3, "1.234"],
        [numbro.RoundingMode.RoundUp, 3, "1.235"],
        [numbro.RoundingMode.RoundCeil, 3, "1.235"],
        [numbro.RoundingMode.RoundHalfUp, 3, "1.235"],
        // ------------------------------
        [numbro.RoundingMode.RoundDown, 4, "1.2345"],
        [numbro.RoundingMode.RoundFloor, 4, "1.2345"],
        [numbro.RoundingMode.RoundUp, 4, "1.2346"],
        [numbro.RoundingMode.RoundCeil, 4, "1.2346"],
        [numbro.RoundingMode.RoundHalfUp, 4, "1.2346"],
      ] as const
    ).forEach(([roundingMode, mantissa, output]) => {
      expect(instance.format({ roundingMode, mantissa })).toEqual(output);
    });
  });

  it("percent correct", function () {
    [
      [1, "100%"],
      [0, "0%"],
      [-0, "0%"],
      [-1, "-100%"],
    ].forEach(([input, output]) => {
      expect(numbro(input).format({ output: "percent" })).toEqual(output);
    });
  });

  it("average correct ", function () {
    [
      [1, "1"],
      [100, "100"],
      ["1000", "1K"],
      ["10000", "10K"],
      ["100000", "100K"],
      ["1000000", "1M"],

      ["9999", "9K"],
      ["99999", "99K"],
      ["999999", "999K"],
      ["9999999", "9M"],
      ["99999999", "99M"],
      ["999999999", "999M"],
      ["9999999999", "9B"],
      ["99999999999", "99B"],
      ["999999999999", "999B"],
    ].forEach(([input, output]) => {
      expect(numbro(input).format({ average: true })).toEqual(output);
    });
  });

  it("add correct", function () {
    const testCase: [any, any, number][] = [
      [0.1, 0.2, 0.3],
      [new BigNumber(0.1), new BigNumber(0.2), 0.3],
      [0.1, new BigNumber(0.2), 0.3],
      [new BigNumber(0.1), 0.2, 0.3],
      [1000, 10, 1010],
      [0.5, 3, 3.5],
      [-100, 200, 100],
      [0.1, 0.2, 0.3],

      [100n, 1, 101],
      [100n, 1n, 101],
    ];

    testCase.forEach(([a, b, output]) => {
      expect(numbro(a).add(b).bigNumber).toEqual(new BigNumber(output));
    });
  });

  it("subtract correct", function () {
    const testCase: [any, any, number][] = [
      [0.3, 0.2, 0.1],
      [new BigNumber(0.3), new BigNumber(0.2), 0.1],
      [0.3, new BigNumber(0.2), 0.1],
      [new BigNumber(0.3), 0.2, 0.1],
      [1000, 10, 990],
      [3, 0.5, 2.5],
      [200, -100, 300],
      [0.3, 0.2, 0.1],

      [100n, 1, 99],
      [100n, 1n, 99],
    ];
    testCase.forEach(([a, b, output]) => {
      expect(numbro(a).subtract(b).bigNumber).toEqual(new BigNumber(output));
    });
  });

  it("multiply correct", function () {
    const testCase: [any, any, number][] = [
      [0.1, 0.2, 0.02],
      [new BigNumber(0.1), new BigNumber(0.2), 0.02],
      [0.1, new BigNumber(0.2), 0.02],
      [new BigNumber(0.1), 0.2, 0.02],
      [1000, 10, 10000],
      [0.5, 3, 1.5],
      [-100, 200, -20000],
      [0.1, 0.2, 0.02],

      [100n, 1, 100],
      [100n, 1n, 100],
    ];

    testCase.forEach(([a, b, output]) => {
      expect(numbro(a).multiply(b).bigNumber).toEqual(new BigNumber(output));
    });
  });

  it("divide correct", function () {
    const testCase: [any, any, number][] = [
      [0.1, 0.2, 0.5],
      [new BigNumber(0.1), new BigNumber(0.2), 0.5],
      [0.1, new BigNumber(0.2), 0.5],
      [new BigNumber(0.1), 0.2, 0.5],
      [1000, 10, 100],
      [-100, 200, -0.5],
      [0.1, 0.2, 0.5],

      [100n, 1, 100],
      [100n, 1n, 100],
    ];
    testCase.forEach(([a, b, output]) => {
      expect(numbro(a).divide(b).bigNumber).toEqual(new BigNumber(output));
    });
  });

  it("mantissa 配置项", () => {
    expect(numbro(1.2345).format({ mantissa: 2 })).toEqual("1.23");
    expect(numbro(1.2345).format({ mantissa: 3 })).toEqual("1.234");
    expect(numbro(1.2345).format({ mantissa: 4 })).toEqual("1.2345");

    expect(numbro(1.2345).format({ mantissa: "2" })).toEqual("1.23");
    expect(numbro(1.2345).format({ mantissa: "3" })).toEqual("1.234");
    expect(numbro(1.2345).format({ mantissa: "4" })).toEqual("1.2345");

    expect(numbro(1.2345).format({ mantissa: null })).toEqual("1.2345");
    expect(numbro(1.2345).format({ mantissa: undefined })).toEqual("1.2345");
  });

  it("formatCurrency", function () {
    (
      [
        [0, "Rp0.00"],
        [0.1, "Rp0.10"],
        [-0.1, "-Rp0.10"],
        [1000, "Rp1,000.00"],
        [1000.1, "Rp1,000.10"],
      ] as const
    ).forEach(([input, output]) => {
      expect(numbro(input).formatCurrency()).toEqual(output);
    });
    expect(numbro(null).formatCurrency()).toEqual("Rp0.00");

    // FIXME: 兼容老的写法
    expect(
      numbro("1").formatCurrency({
        currencySymbol: "$",
      }),
    ).toEqual("$1.00");
    (
      [
        [0, "Rp0.00"],
        [1, "+Rp1.00"],
        [-1, "-Rp1.00"],
      ] as const
    ).forEach(([input, output]) => {
      expect(
        numbro(input).formatCurrency({
          forceSign: true,
        }),
      ).toEqual(output);
    });
  });

  it("formatCurrency with builtin locale config", function () {
    (
      [
        [1000, LocalesEnum.en, "$1,000.00"],
        [1000, LocalesEnum.id, "Rp1,000.00"],
        [1000, LocalesEnum.zh, "¥1,000.00"],
      ] as const
    ).forEach(([input, locale, output]) => {
      expect(
        numbro(input).formatCurrency({
          locale,
        }),
      ).toBe(output);
    });
  });

  it("formatCurrency with custom locale config", function () {
    Numbro.setDefaultCurrencies({
      "de-AT": {
        mantissa: 2,
        position: "prefix",
        symbol: "€",
      },
      "de-DE": {
        mantissa: 2,
        position: "postfix",
        symbol: "€",
        decimalSeparator: ",",
        groupSeparator: " ",
      },
    });
    Numbro.setLocale("de-AT");
    expect(numbro(1000).formatCurrency()).toEqual("€1,000.00");
    expect(
      numbro(1000).formatCurrency({
        locale: "de-DE",
      }),
    ).toEqual("1 000,00€");
  });

  it("业务场景：通用法币、主法币", () => {
    Numbro.setDefaultCurrencies({
      common: {
        symbol: "$",
        position: "prefix",
        mantissa: 2,
      },
      main: {
        symbol: "Rp",
        position: "prefix",
        mantissa: 2,
      },
    });

    expect(
      numbro(1000).formatCurrency({
        locale: "common",
      }),
    ).toEqual("$1,000.00");
    expect(
      numbro(1000).formatCurrency({
        locale: "main",
      }),
    ).toEqual("Rp1,000.00");
  });

  it("异常情况兼容", function () {
    const n = numbro(1.2345);
    expect(
      n.format({
        mantissa: NaN,
      }),
    ).toEqual("1.2345");
  });

  it("can set default by setDefaultFormat", () => {
    Numbro.setDefaultFormat({
      thousandSeparated: true,
      mantissa: 2,
    });
    expect(numbro(1000).format()).toEqual("1,000.00");
  });

  it("support NaNFormat", () => {
    expect(numbro(NaN).format()).toEqual("0");
    expect(numbro(NaN).format({ NaNFormat: "-" })).toEqual("-");
    expect(numbro(undefined).format({ NaNFormat: "-" })).toEqual("-");
    expect(numbro(null).format({ NaNFormat: "-" })).toEqual("-");
    expect(
      numbro(null).formatCurrency({
        NaNFormat: "-",
      }),
    ).toEqual("-");
  });
  it("support NaNFormat with default format", () => {
    Numbro.setDefaultFormat({
      NaNFormat: "-",
    });
    expect(numbro(NaN).format()).toEqual("-");
    expect(numbro(undefined).format()).toEqual("-");
    expect(numbro(null).format()).toEqual("-");
    expect(numbro(null).formatCurrency()).toEqual("-");
    expect(
      numbro(null).formatCurrency({
        NaNFormat: false,
      }),
    ).toEqual("Rp0.00");
  });

  it("valueOf correct", () => {
    expect(numbro(NaN).valueOf()).toEqual(0);
    expect(numbro(1).valueOf()).toEqual(1);
  });
});
