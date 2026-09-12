import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { format } from 'oxfmt';
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

type FixtureExpectation = {
  caseName: string;
  id: string;
  inputFile?: string;
  expectedFile?: string;
  options?: Dune2ViteInput;
  environment?: TestEnvironment;
};

const OUTPUT_NULL = 'output.null';
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dirname, 'vite-plugin', 'fixtures');

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

function loadCode(path: string): string {
  let source = readFileSync(path, 'utf-8');
  source = source.replace(/\/\/.*/g, '');
  source = source.replace(/\n\s*\n/g, '\n');
  return source;
}

async function formatCode(filePath: string, source: string): Promise<string> {
  const { code, errors } = await format(filePath, source);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join('\n'));
  }
  return code;
}

async function expectFixture({
  caseName,
  id,
  inputFile = 'input.js',
  expectedFile = 'output.js',
  options,
  environment,
}: FixtureExpectation): Promise<void> {
  const caseDir = join(FIXTURE_DIR, caseName);
  const inputPath = join(caseDir, inputFile);
  const code = loadCode(inputPath);

  const result = await runTransform(code, id, options, environment);

  if (expectedFile === OUTPUT_NULL) {
    expect(result).toBeNull();
    return;
  }

  expect(result).toBeTruthy();

  const outputPath = join(caseDir, expectedFile);
  const expectedCode = loadCode(outputPath);

  const [actual, expected] = await Promise.all([
    formatCode(outputPath, result!.code),
    formatCode(outputPath, expectedCode),
  ]);

  expect(actual).toEqual(expected);
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
    await expectFixture({
      caseName: 'non-script-null',
      id: '/abs/path/foo.css',
      inputFile: 'input.css',
      expectedFile: OUTPUT_NULL,
    });
  });

  it('returns null when no trigger identifier is present', async () => {
    await expectFixture({
      caseName: 'no-trigger-null',
      id: '/abs/path/foo.ts',
      expectedFile: OUTPUT_NULL,
    });
  });

  it('skips virtual module ids', async () => {
    await expectFixture({
      caseName: 'virtual-id-null',
      id: '\0virtual:foo.ts',
      expectedFile: OUTPUT_NULL,
    });
  });

  it('transforms createIsomorphicFn().server().client() chain', async () => {
    await expectFixture({
      caseName: 'isomorphic-server',
      id: '/abs/path/iso.ts',
    });
  });

  it('keeps client branch when consumer is client', async () => {
    await expectFixture({
      caseName: 'isomorphic-client',
      id: '/abs/path/iso.ts',
      options: { consumer: 'client' },
    });
  });

  it('transforms createServerOnlyFn by default server consumer', async () => {
    await expectFixture({
      caseName: 'server-only-server',
      id: '/abs/path/server-only.ts',
    });
  });

  it('replaces createServerOnlyFn with thrower for client consumer', async () => {
    await expectFixture({
      caseName: 'server-only-client-throws',
      id: '/abs/path/server-only.ts',
      options: { consumer: 'client' },
    });
  });

  it('replaces createClientOnlyFn with thrower for default server consumer', async () => {
    await expectFixture({
      caseName: 'client-only-server-throws',
      id: '/abs/path/client-only.ts',
    });
  });

  it('keeps createClientOnlyFn function for client consumer', async () => {
    await expectFixture({
      caseName: 'client-only-client',
      id: '/abs/path/client-only.ts',
      options: { consumer: 'client' },
    });
  });

  it('transforms independent helper calls in one pass', async () => {
    await expectFixture({
      caseName: 'mixed-one-pass-server',
      id: '/abs/path/mixed.ts',
      options: { consumer: 'server' },
    });
  });

  it('transforms JSX-bearing .tsx through the Tsx grammar', async () => {
    await expectFixture({
      caseName: 'jsx-server',
      id: '/abs/path/view.tsx',
      inputFile: 'input.tsx',
      expectedFile: 'output.tsx',
    });
  });

  it('transforms JSX-bearing .js through the JavaScript grammar', async () => {
    await expectFixture({
      caseName: 'jsx-server',
      id: '/abs/path/view.js',
      inputFile: 'input.tsx',
      expectedFile: 'output.tsx',
    });
  });

  it('supports environment resolver for different consumers', async () => {
    const options: Dune2ViteOptionsFactory = (environment) => {
      return { consumer: environment.config.consumer };
    };

    await Promise.all([
      expectFixture({
        caseName: 'env-resolver',
        id: '/abs/path/iso.ts',
        options,
        environment: { config: { consumer: 'server' } },
        expectedFile: 'output.server.js',
      }),
      expectFixture({
        caseName: 'env-resolver',
        id: '/abs/path/iso.ts',
        options,
        environment: { config: { consumer: 'client' } },
        expectedFile: 'output.client.js',
      }),
    ]);
  });

  it('supports disabling transform by environment resolver', async () => {
    const options: Dune2ViteOptionsFactory = (environment) => {
      if (environment.config.consumer === 'server') return false;
      return { consumer: 'client' };
    };

    await expectFixture({
      caseName: 'env-resolver-disabled-server',
      id: '/abs/path/iso.ts',
      options,
      environment: { config: { consumer: 'server' } },
      expectedFile: OUTPUT_NULL,
    });
  });
});
