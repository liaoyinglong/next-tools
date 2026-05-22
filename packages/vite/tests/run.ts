import { readFileSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { format } from 'oxfmt';
import { expect, it } from 'vitest';

async function formatTs(filePath: string, source: string) {
  const { code, errors } = await format(filePath, source);
  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join('\n'));
  }
  return code;
}

export type Compile = (code: string, filename: string) => string;

const loadCode = (path: string) => {
  let r = readFileSync(path, 'utf-8');
  // 移除注释
  r = r.replace(/\/\/.*/g, '');
  // 移除空行
  r = r.replace(/\n\s*\n/g, '\n');
  return r;
};

async function fixture(dir: string, compile: Compile) {
  const inputFilePath = join(dir, 'input.js');
  const outputFilePath = join(dir, 'output.js');

  const code = loadCode(inputFilePath);
  const expectedCode = loadCode(outputFilePath);

  const actualCode = compile(code, inputFilePath);

  const [actuallyOutput, expectedOutput] = await Promise.all([
    formatTs(outputFilePath, actualCode),
    formatTs(outputFilePath, expectedCode),
  ]);

  expect(actuallyOutput).toEqual(expectedOutput);
}

export async function fixtures(baseDir: string, compile: Compile) {
  const fixtureDir = join(baseDir, 'fixtures');
  const items = await readdir(fixtureDir, {
    withFileTypes: true,
  });
  const dirs = items
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  it.each(dirs)(`run %s`, async (dir) => {
    await fixture(join(fixtureDir, dir), compile);
  });
}
