import glob from "fast-glob";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { run } from "./run";

const cwd = path.join(__dirname, "fixtures");
const files = glob.sync("**/input.tsx", {
  cwd,
});

describe("react compiler fixtures", () => {
  files.forEach((file) => {
    const name = file.replace("/input.tsx", "");
    const expectOutput = file.replace("/input.tsx", "/output.tsx");
    const outputFile = path.join(cwd, expectOutput);
    it(name, async () => {
      const res = await run(path.join(cwd, file));

      // 判断是否有 output 文件
      if (fs.existsSync(outputFile)) {
        await expect(res.code).toMatchFileSnapshot(outputFile);
      } else {
        console.log(`can not find output file: ${expectOutput}`);
        if (res.canCompile) {
          console.log(`here is current compiled code:`);
          console.log(res.code);
        } else {
          console.warn(`unable to compile`);
        }
      }
    });
  });
});
