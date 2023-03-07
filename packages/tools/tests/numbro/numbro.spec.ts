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
    ].forEach(([input, output]) => {
      expect(numbro(input).bigNumber).toEqual(new BigNumber(output as never));
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

  it("格式化不丢失精度", function () {
    const a = [
      [1, 2, "1.00"],
      [1.1, 2, "1.10"],
      [1000, 2, "1,000.00"],
      ["24411725.000021970552501575", 18, "24,411,725.000021970552501575"],
      ["24411725.000021970552501575", 8, "24,411,725.00002197"],
    ] as const;
    a.forEach(([num, precision, output]) => {
      expect(
        numbro(num).format({ mantissa: precision, thousandSeparated: true })
      ).toEqual(output);
    });
  });
});
