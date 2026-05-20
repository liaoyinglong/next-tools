import { describe, expect, it } from 'vitest';
import dune2 from '../src/index';

async function runTransform(code: string, id: string) {
  const plugin = dune2();
  const transform = plugin.transform;
  if (typeof transform !== 'function') {
    throw new Error('plugin.transform is not a function');
  }
  // Vite plugins expose transform as an object on newer versions; handle both.
  const fn = (transform as any).handler ?? transform;
  return fn.call({} as any, code, id);
}

describe('@dune2/vite plugin', () => {
  it('transforms .ts files containing createServerOnlyFn', async () => {
    const result = await runTransform(
      `import { createServerOnlyFn } from 'stub';\nexport const f = createServerOnlyFn(() => 1);`,
      '/abs/path/foo.ts',
    );
    expect(result).toBeTruthy();
    expect(result!.code).toMatch(/=>\s*1/);
    expect(result!.code).not.toMatch(/createServerOnlyFn/);
  });

  it('returns null for non-script files (.css)', async () => {
    const result = await runTransform(
      `body { color: red; }`,
      '/abs/path/foo.css',
    );
    expect(result).toBeNull();
  });

  it('returns null when no trigger identifier is present', async () => {
    const result = await runTransform(
      `export const x = 1;`,
      '/abs/path/foo.ts',
    );
    expect(result).toBeNull();
  });

  it('skips virtual module ids', async () => {
    const result = await runTransform(
      `import { createServerOnlyFn } from 'stub';\nconst f = createServerOnlyFn(() => 1);`,
      '\0virtual:foo.ts',
    );
    expect(result).toBeNull();
  });

  it('throws codeframe error when createServerFn is used', async () => {
    await expect(
      runTransform(
        `import { createServerFn } from '@tanstack/react-start';\nconst fn = createServerFn().handler(() => 1);`,
        '/abs/path/server.ts',
      ),
    ).rejects.toThrow(/createServerFn\(\) is not supported/);
  });

  it('transforms createIsomorphicFn().server().client() chain', async () => {
    const result = await runTransform(
      `import { createIsomorphicFn } from 'stub';\nexport const log = createIsomorphicFn().server((m) => console.log('s', m)).client((m) => console.log('c', m));`,
      '/abs/path/iso.ts',
    );
    expect(result).toBeTruthy();
    expect(result!.code).toMatch(/console\.log\('s'/);
    expect(result!.code).not.toMatch(/console\.log\('c'/);
    expect(result!.code).not.toMatch(/createIsomorphicFn/);
  });
});
