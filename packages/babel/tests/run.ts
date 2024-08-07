import { PluginItem, parseAsync, transformFromAstAsync } from "@babel/core";
import { readFileSync } from "fs";
import { join } from "path";
import { format } from "prettier";
import { expect } from "vitest";

const fixtureDir = join(__dirname, "../../swc_plugin/tests/fixture");

const loadCode = (path: string) => {
  let r = readFileSync(path, "utf-8");
  // 移除注释
  r = r.replace(/\/\/.*/g, "");
  // 移除空行
  r = r.replace(/\n\s*\n/g, "\n");
  return r;
};

export async function matchSwcPluginOutput(dir: string, plugin: PluginItem) {
  const inputFilePath = join(fixtureDir, dir, "input.js");
  const outputFilePath = join(fixtureDir, dir, "output.js");

  const code = loadCode(inputFilePath);

  const ast = await parseAsync(code, {
    filename: inputFilePath,
    sourceType: "module",
    plugins: [
      [
        require.resolve("@babel/plugin-syntax-typescript"),
        {
          isTSX: true,
          allExtensions: true,
        },
      ],
    ],
  });
  const res = await transformFromAstAsync(ast!, code, {
    filename: inputFilePath,
    plugins: [plugin],
    sourceType: "module",
    sourceMaps: false,
    code: true,
    ast: false,
    retainLines: false,
    generatorOpts: {
      jsescOption: { minimal: true },
    },
  });

  expect(res).toBeTruthy();
  expect(res!.code).toBeTruthy();

  const actuallyOutput = await format(res!.code!, {
    parser: "typescript",
  });
  const expectedOutput = await format(loadCode(outputFilePath), {
    parser: "typescript",
  });
  expect(actuallyOutput).toEqual(expectedOutput);
}
