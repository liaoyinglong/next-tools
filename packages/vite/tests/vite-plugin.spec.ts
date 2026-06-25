import { describe, expect, it } from 'vitest';
import {
  dune2Vite as dune2,
  type Dune2ViteOptions,
  type Dune2ViteOptionsFactory,
} from '../src/index';

type Dune2ViteInput = Dune2ViteOptions | Dune2ViteOptionsFactory;
type TestEnvironment = {
  config: {
    consumer: 'server' | 'client';
  };
};

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

async function runTransform(
  code: string,
  id: string,
  options?: Dune2ViteInput,
  environment?: TestEnvironment,
) {
  let plugin = dune2(options as Dune2ViteInput) as any;
  if (typeof plugin.applyToEnvironment === 'function') {
    const applied = await plugin.applyToEnvironment(
      environment ?? ({ config: { consumer: 'server' } } as TestEnvironment),
    );
    if (applied === false) return null;
    if (applied && typeof applied === 'object') {
      plugin = applied;
    }
  }

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

  it('keeps client branch when consumer is client', async () => {
    const result = await runTransform(
      `import { createIsomorphicFn } from 'stub';\nexport const log = createIsomorphicFn().server((m) => console.log('s', m)).client((m) => console.log('c', m));`,
      '/abs/path/iso.ts',
      { consumer: 'client' },
    );
    expect(result).toBeTruthy();
    expect(result!.code).toMatch(/console\.log\('c'/);
    expect(result!.code).not.toMatch(/console\.log\('s'/);
    expect(result!.code).not.toMatch(/createIsomorphicFn\s*\(/);
  });

  it('transforms createServerOnlyFn by default server consumer', async () => {
    const result = await runTransform(
      `import { createServerOnlyFn } from 'stub';\nexport const getSecret = createServerOnlyFn(() => 'secret');`,
      '/abs/path/server-only.ts',
    );

    expect(result).toBeTruthy();
    expect(result!.code).toMatch(/\(\) => 'secret'/);
    expect(result!.code).not.toMatch(/createServerOnlyFn\s*\(/);
  });

  it('replaces createServerOnlyFn with thrower for client consumer', async () => {
    const result = await runTransform(
      `import { createServerOnlyFn } from 'stub';\nexport const getSecret = createServerOnlyFn(() => 'secret');`,
      '/abs/path/server-only.ts',
      { consumer: 'client' },
    );

    expect(result).toBeTruthy();
    expect(result!.code).toMatch(
      /createServerOnlyFn\(\) functions can only be called on the server!/,
    );
    expect(result!.code).toMatch(/export const getSecret = \(\) => \{/);
  });

  it('replaces createClientOnlyFn with thrower for default server consumer', async () => {
    const result = await runTransform(
      `import { createClientOnlyFn } from 'stub';\nexport const readWindow = createClientOnlyFn(() => window.location.href);`,
      '/abs/path/client-only.ts',
    );

    expect(result).toBeTruthy();
    expect(result!.code).toMatch(
      /createClientOnlyFn\(\) functions can only be called on the client!/,
    );
    expect(result!.code).toMatch(/export const readWindow = \(\) => \{/);
  });

  it('keeps createClientOnlyFn function for client consumer', async () => {
    const result = await runTransform(
      `import { createClientOnlyFn } from 'stub';\nexport const readWindow = createClientOnlyFn(() => window.location.href);`,
      '/abs/path/client-only.ts',
      { consumer: 'client' },
    );

    expect(result).toBeTruthy();
    expect(result!.code).toMatch(/\(\) => window\.location\.href/);
    expect(result!.code).not.toMatch(/createClientOnlyFn\s*\(/);
  });

  it('transforms independent helper calls in one pass', async () => {
    const result = await runTransform(
      `import { createIsomorphicFn, createClientOnlyFn } from 'stub';\nexport const run = createIsomorphicFn().server(() => 'server').client(() => 'client');\nexport const readWindow = createClientOnlyFn(() => window.location.href);`,
      '/abs/path/mixed.ts',
      { consumer: 'server' },
    );

    expect(result).toBeTruthy();
    expect(result!.code).toMatch(
      /createClientOnlyFn\(\) functions can only be called on the client!/,
    );
    expect(result!.code).not.toMatch(/createIsomorphicFn\s*\(/);
    expect(result!.code).not.toMatch(/readWindow = createClientOnlyFn\s*\(/);
  });

  it('supports environment resolver for different consumers', async () => {
    const options: Dune2ViteOptionsFactory = (environment) => {
      return { consumer: environment.config.consumer };
    };
    const [serverResult, clientResult] = await Promise.all([
      runTransform(
        `import { createIsomorphicFn } from 'stub';\nexport const log = createIsomorphicFn().server((m) => console.log('s', m)).client((m) => console.log('c', m));`,
        '/abs/path/iso.ts',
        options,
        { config: { consumer: 'server' } },
      ),
      runTransform(
        `import { createIsomorphicFn } from 'stub';\nexport const log = createIsomorphicFn().server((m) => console.log('s', m)).client((m) => console.log('c', m));`,
        '/abs/path/iso.ts',
        options,
        { config: { consumer: 'client' } },
      ),
    ]);

    expect(serverResult).toBeTruthy();
    expect(serverResult!.code).toMatch(/console\.log\('s'/);
    expect(serverResult!.code).not.toMatch(/console\.log\('c'/);

    expect(clientResult).toBeTruthy();
    expect(clientResult!.code).toMatch(/console\.log\('c'/);
    expect(clientResult!.code).not.toMatch(/console\.log\('s'/);
  });

  it('supports disabling transform by environment resolver', async () => {
    const options: Dune2ViteOptionsFactory = (environment) => {
      if (environment.config.consumer === 'server') return false;
      return { consumer: 'client' };
    };
    const result = await runTransform(
      `import { createIsomorphicFn } from 'stub';\nexport const log = createIsomorphicFn().server((m) => console.log('s', m)).client((m) => console.log('c', m));`,
      '/abs/path/iso.ts',
      options,
      { config: { consumer: 'server' } },
    );

    expect(result).toBeNull();
  });
});
