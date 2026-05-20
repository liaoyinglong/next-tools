import { readFileSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { PluginItem, parseAsync, transformFromAstAsync } from '@babel/core';
import { format } from 'prettier';
import { expect, it } from 'vitest';

const loadCode = (path: string) => {
  let r = readFileSync(path, 'utf-8');
  // 移除注释
  r = r.replace(/\/\/.*/g, '');
  // 移除空行
  r = r.replace(/\n\s*\n/g, '\n');
  return r;
};

async function fixture(dir: string, plugin: PluginItem | PluginItem[]) {
  const inputFilePath = join(dir, 'input.js');
  const outputFilePath = join(dir, 'output.js');

  const code = loadCode(inputFilePath);
  const expectedCode = loadCode(outputFilePath);

  const parserPlugins: PluginItem[] = [
    [
      require.resolve('@babel/plugin-syntax-typescript'),
      {
        isTSX: true,
        allExtensions: true,
      },
    ],
  ];

  const generatorOpts = {
    jsescOption: { minimal: true },
  };

  const [ast, expectedAst] = await Promise.all([
    parseAsync(code, {
      filename: inputFilePath,
      sourceType: 'module',
      plugins: parserPlugins,
    }),
    parseAsync(expectedCode, {
      filename: outputFilePath,
      sourceType: 'module',
      plugins: parserPlugins,
    }),
  ]);
  const [res, expectedRes] = await Promise.all([
    transformFromAstAsync(ast!, code, {
      filename: inputFilePath,
      plugins: Array.isArray(plugin) ? plugin : [plugin],
      sourceType: 'module',
      sourceMaps: false,
      code: true,
      ast: false,
      retainLines: false,
      generatorOpts,
    }),
    transformFromAstAsync(expectedAst!, expectedCode, {
      filename: outputFilePath,
      plugins: [],
      sourceType: 'module',
      sourceMaps: false,
      code: true,
      ast: false,
      retainLines: false,
      generatorOpts,
    }),
  ]);

  expect(res).toBeTruthy();
  expect(res!.code).toBeTruthy();
  expect(expectedRes).toBeTruthy();
  expect(expectedRes!.code).toBeTruthy();

  const [actuallyOutput, expectedOutput] = await Promise.all([
    format(res!.code!, {
      parser: 'typescript',
    }),
    format(expectedRes!.code!, {
      parser: 'typescript',
    }),
  ]);

  expect(actuallyOutput).toEqual(expectedOutput);
}

export async function fixtures(
  baseDir: string,
  plugin: PluginItem | PluginItem[],
) {
  const fixtureDir = join(baseDir, 'fixtures');
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
