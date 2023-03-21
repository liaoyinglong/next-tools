import BigNumber from "bignumber.js";
import { describe, it, expect } from "vitest";
import { numbro } from "../../src";
describe("numbro", () => {
  it("normalizeInput", () => {
    [
      [1, 1],
      ["", 0],
      [null, 0],
      [undefined, 0],
      [NaN, 0],
      [false, 0],
      [Infinity, Infinity],
      [-Infinity, -Infinity],

      ["1,000", 1000],
      ["1,000.000", 1000],
    ].forEach(([input, output]) => {
      expect(numbro(input).bigNumber).toEqual(new BigNumber(output as never));
    });
  });

  it("default format", function () {
    expect(numbro("1.230000").format({})).toEqual("1.23");
    expect(numbro("1.230000").toString()).toEqual("1.23");
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
        numbro(input).format({ mantissa, deleteInvalidZero: true })
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
        })
      ).toEqual(output);
    });

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
        })
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
        output
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
        })
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
        })
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
    ] as const;
    a.forEach(([num, precision, output]) => {
      expect(
        numbro(num).format({ mantissa: precision, thousandSeparated: true })
      ).toEqual(output);
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
      expect(
        numbro(input).format({ average: true, thousandSeparated: true })
      ).toEqual(output);
    });
  });

  it("add correct", function () {
    [
      [0.1, 0.2, 0.3],
      [new BigNumber(0.1), new BigNumber(0.2), 0.3],
      [0.1, new BigNumber(0.2), 0.3],
      [new BigNumber(0.1), 0.2, 0.3],
      [1000, 10, 1010],
      [0.5, 3, 3.5],
      [-100, 200, 100],
      [0.1, 0.2, 0.3],
    ].forEach(([a, b, output]) => {
      expect(numbro(a).add(b).bigNumber).toEqual(new BigNumber(output));
    });
  });

  it("subtract correct", function () {
    [
      [0.3, 0.2, 0.1],
      [new BigNumber(0.3), new BigNumber(0.2), 0.1],
      [0.3, new BigNumber(0.2), 0.1],
      [new BigNumber(0.3), 0.2, 0.1],
      [1000, 10, 990],
      [3, 0.5, 2.5],
      [200, -100, 300],
      [0.3, 0.2, 0.1],
    ].forEach(([a, b, output]) => {
      expect(numbro(a).subtract(b).bigNumber).toEqual(new BigNumber(output));
    });
  });

  it("multiply correct", function () {
    [
      [0.1, 0.2, 0.02],
      [new BigNumber(0.1), new BigNumber(0.2), 0.02],
      [0.1, new BigNumber(0.2), 0.02],
      [new BigNumber(0.1), 0.2, 0.02],
      [1000, 10, 10000],
      [0.5, 3, 1.5],
      [-100, 200, -20000],
      [0.1, 0.2, 0.02],
    ].forEach(([a, b, output]) => {
      expect(numbro(a).multiply(b).bigNumber).toEqual(new BigNumber(output));
    });
  });

  it("divide correct", function () {
    [
      [0.1, 0.2, 0.5],
      [new BigNumber(0.1), new BigNumber(0.2), 0.5],
      [0.1, new BigNumber(0.2), 0.5],
      [new BigNumber(0.1), 0.2, 0.5],
      [1000, 10, 100],
      [-100, 200, -0.5],
      [0.1, 0.2, 0.5],
    ].forEach(([a, b, output]) => {
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
        [0, 2, "Rp0.00"],
        [0.1, 2, "Rp0.10"],
        [1000, 2, "Rp1,000.00"],
        [1000.1, 2, "Rp1,000.10"],
      ] as const
    ).forEach(([input, mantissa, output]) => {
      expect(
        numbro(input).formatCurrency({
          mantissa,
          currencySymbol: "Rp",
          thousandSeparated: true,
        })
      ).toEqual(output);
    });
  });
});
