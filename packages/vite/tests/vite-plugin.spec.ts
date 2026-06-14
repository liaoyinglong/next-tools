import { describe, expect, it } from 'vitest';
import { dune2Vite as dune2 } from '../src/index';

function testFilter(value: string, spec: unknown): boolean {
  if (!spec) return true;
  if (spec instanceof RegExp) return spec.test(value);
  if (typeof spec === 'string') return value.includes(spec);
  if (Array.isArray(spec)) return spec.some((s) => testFilter(value, s));
  if (typeof spec === 'object' && spec !== null) {
    const { include, exclude } = spec as Record<string, unknown>;
    if (exclude && testFilter(value, exclude)) return false;
    if (include) return testFilter(value, include);
  }
  return true;
}

async function runTransform(code: string, id: string) {
  const plugin = dune2();
  const transform = plugin.transform;
  if (!transform) {
    throw new Error('plugin.transform is not defined');
  }
  const fn =
    typeof transform === 'function' ? transform : (transform as any).handler;
  if (typeof fn !== 'function') {
    throw new Error('plugin.transform.handler is not a function');
  }
  const filter =
    typeof transform === 'object' ? (transform as any).filter : null;
  if (filter) {
    if (!testFilter(id, filter.id)) return null;
    if (!testFilter(code, filter.code)) return null;
  }
  return fn.call({} as any, code, id);
}

describe('@dune2/vite plugin', () => {
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
      `import { createIsomorphicFn } from 'stub';\nconst f = createIsomorphicFn().server(() => 1).client(() => 2);`,
      '\0virtual:foo.ts',
    );
    expect(result).toBeNull();
  });

  it('transforms createIsomorphicFn().server().client() chain', async () => {
    const result = await runTransform(
      `import { createIsomorphicFn } from 'stub';\nexport const log = createIsomorphicFn().server((m) => console.log('s', m)).client((m) => console.log('c', m));`,
      '/abs/path/iso.ts',
    );
    expect(result).toBeTruthy();
    expect(result!.code).toMatch(/console\.log\('s'/);
    expect(result!.code).not.toMatch(/console\.log\('c'/);
    expect(result!.code).not.toMatch(/createIsomorphicFn\s*\(/);
  });
});
