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

  it("小数格式化不丢失精度", function () {
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
