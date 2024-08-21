import glob from "fast-glob";
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
    it(name, async () => {
      const res = await run(path.join(cwd, file));
      await expect(res.code).toMatchFileSnapshot(path.join(cwd, expectOutput));
    });
  });
});
