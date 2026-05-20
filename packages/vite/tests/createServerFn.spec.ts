import { transformAsync } from '@babel/core';
import { describe, expect, it } from 'vitest';
import { createServerFnPlugin } from '../src/transforms/createServerFn';

async function compile(code: string) {
  return transformAsync(code, {
    filename: 'test.ts',
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    plugins: [
      ['@babel/plugin-syntax-typescript', { isTSX: true, allExtensions: true }],
      createServerFnPlugin,
    ],
  });
}

describe('createServerFn', () => {
  it('throws on bare createServerFn() call', async () => {
    await expect(
      compile(
        `import { createServerFn } from '@tanstack/react-start';\nconst fn = createServerFn();`,
      ),
    ).rejects.toThrow(/createServerFn\(\) is not supported/);
  });

  it('throws on createServerFn().handler(fn) chain', async () => {
    await expect(
      compile(
        `import { createServerFn } from '@tanstack/react-start';\nconst fn = createServerFn().handler(async () => 1);`,
      ),
    ).rejects.toThrow(/createServerFn\(\) is not supported/);
  });

  it('does not throw when createServerFn is a local (non-imported) identifier', async () => {
    const code = `function createServerFn() { return { handler: (fn) => fn } }\nconst fn = createServerFn().handler(() => 1);`;
    const result = await compile(code);
    expect(result?.code).toBeTruthy();
  });

  it('does not throw when no createServerFn call is present', async () => {
    const code = `import { createServerFn } from '@tanstack/react-start';\nconsole.log(typeof createServerFn);`;
    const result = await compile(code);
    expect(result?.code).toBeTruthy();
  });
});
