import { PluginItem, parseAsync, transformFromAstAsync } from "@babel/core";
import { readFileSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import { format } from "prettier";
import { expect, it } from "vitest";

const swcFixtureDir = join(__dirname, "../../swc_plugin/tests/fixture");

const loadCode = (path: string) => {
  let r = readFileSync(path, "utf-8");
  // 移除注释
  r = r.replace(/\/\/.*/g, "");
  // 移除空行
  r = r.replace(/\n\s*\n/g, "\n");
  return r;
};

export async function matchSwcPluginOutput(
  dir: string,
  plugin: PluginItem | PluginItem[],
) {
  const inputFilePath = join(swcFixtureDir, dir, "input.js");
  const outputFilePath = join(swcFixtureDir, dir, "output.js");

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
    plugins: Array.isArray(plugin) ? plugin : [plugin],
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

async function fixture(dir: string, plugin: PluginItem | PluginItem[]) {
  const inputFilePath = join(dir, "input.js");
  const outputFilePath = join(dir, "output.js");

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
    plugins: Array.isArray(plugin) ? plugin : [plugin],
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

  const [actuallyOutput, expectedOutput] = await Promise.all([
    format(res!.code!, {
      parser: "typescript",
    }),
    format(loadCode(outputFilePath), {
      parser: "typescript",
    }),
  ]);
  //console.log(actuallyOutput);
  expect(actuallyOutput).toEqual(expectedOutput);
}

export async function fixtures(
  baseDir: string,
  plugin: PluginItem | PluginItem[],
) {
  const fixtureDir = join(baseDir, "fixtures");
  const items = await readdir(fixtureDir, {
    withFileTypes: true,
  });
  const dirs = items
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  it.each(dirs)(`run %s`, async (dir) => {
    await fixture(join(fixtureDir, dir), plugin);
  });
}
