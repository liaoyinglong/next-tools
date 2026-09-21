import { EventEmitter } from 'node:events';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { spawnMock } = vi.hoisted(() => ({ spawnMock: vi.fn() }));

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return { ...actual, spawn: spawnMock };
});

// formatter 通过 spawn 运行，返回一个会发出 exit 事件的伪子进程
const makeChild = (code: number, signal: string | null = null) => {
  const child = new EventEmitter();
  queueMicrotask(() => child.emit('exit', code, signal));
  return child;
};

vi.mock('../src/shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/shared/config')>();
  return { ...actual, getConfig: vi.fn() };
});

vi.mock('../src/shared/promptConfigEnable', () => ({
  promptApiConfigEnable: vi.fn(),
}));

import { generateApi, generatePaths } from '../src/commands/generateApi';
import { runCodeFormatter } from '../src/commands/generateApi/formatter';
import { parseSwagger } from '../src/commands/generateApi/parseSwagger';
import { getConfig } from '../src/shared/config';
import { apiConfigNormalizer } from '../src/shared/config/normalizeConfig';
import { promptApiConfigEnable } from '../src/shared/promptConfigEnable';

const makeDoc = () =>
  ({
    openapi: '3.0.0',
    info: { title: 'test', version: '1.0.0' },
    paths: {
      '/users:search': {
        get: {
          summary: '搜索用户',
          operationId: 'searchUsers',
          parameters: [
            {
              name: 'q',
              in: 'query',
              description: '关键字',
              schema: { type: 'string', default: 'placeholder' },
            },
          ],
          responses: {
            200: {
              description: 'ok',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', default: '' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }) as never;

const makeState = (parsed: unknown) =>
  ({ parsed, parser: { $refs: new Map() } }) as never;

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dune-cli-test-'));
});

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('parseSwagger', () => {
  it('fetches remote documents and strips default keywords', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeDoc(),
    });
    vi.stubGlobal('fetch', fetchMock);

    const config = apiConfigNormalizer({
      swaggerJSONPath: 'https://example.com/openapi.json',
      output: path.join(tmpDir, 'apis'),
    });
    const state = await parseSwagger(config);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/openapi.json');
    expect(init.signal).toBeInstanceOf(AbortSignal);

    const doc = state.parsed as never as {
      paths: Record<string, { get: { parameters: { schema: object }[] } }>;
    };
    expect(Object.keys(doc.paths)).toEqual(['/users:search']);
    // default 会在生成类型前被深度移除，避免交叉类型污染
    expect(doc.paths['/users:search'].get.parameters[0].schema).toEqual({
      type: 'string',
    });
  });

  it('rejects when the remote document responds with an error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }),
    );

    await expect(
      parseSwagger(
        apiConfigNormalizer({
          swaggerJSONPath: 'https://example.com/missing.json',
          output: path.join(tmpDir, 'apis'),
        }),
      ),
    ).rejects.toThrow('HTTP 404 Not Found');
  });

  it('loads local documents from disk without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const swaggerPath = path.join(tmpDir, 'openapi.json');
    await fs.writeFile(swaggerPath, JSON.stringify(makeDoc()));

    const state = await parseSwagger(
      apiConfigNormalizer({
        swaggerJSONPath: swaggerPath,
        output: path.join(tmpDir, 'apis'),
      }),
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      Object.keys((state.parsed as never as { paths: object }).paths),
    ).toEqual(['/users:search']);
  });

  it('rejects when a local document does not exist', async () => {
    await expect(
      parseSwagger(
        apiConfigNormalizer({
          swaggerJSONPath: path.join(tmpDir, 'nope.json'),
          output: path.join(tmpDir, 'apis'),
        }),
      ),
    ).rejects.toThrow();
  });
});

describe('generatePaths', () => {
  it('writes one file per operation with a sanitized path', async () => {
    const output = path.join(tmpDir, 'apis');
    const result = await generatePaths(
      apiConfigNormalizer({ swaggerJSONPath: 'x.json', output }),
      makeState(makeDoc()),
    );

    expect(result).toEqual({
      hasPaths: true,
      generatedCount: 1,
      skippedCount: 0,
    });

    const file = path.join(output, 'users_search', 'get.ts');
    const code = await fs.readFile(file, 'utf8');
    expect(code).toContain("url: '/users:search'");
    expect(code).toContain('export const usersSearchGetApi');
    expect(code).toContain('export namespace usersSearchGetApi');
    // default 值不得泄漏进生成的类型
    expect(code).not.toContain('default:');
  });

  it('emits .js files when enableTs is off', async () => {
    const output = path.join(tmpDir, 'apis');
    await generatePaths(
      apiConfigNormalizer({
        swaggerJSONPath: 'x.json',
        output,
        enableTs: false,
      }),
      makeState(makeDoc()),
    );

    await expect(
      fs.access(path.join(output, 'users_search', 'get.js')),
    ).resolves.toBeUndefined();
  });

  it('reports hasPaths false for documents without paths', async () => {
    const result = await generatePaths(
      apiConfigNormalizer({
        swaggerJSONPath: 'x.json',
        output: path.join(tmpDir, 'apis'),
      }),
      makeState({ openapi: '3.0.0', info: { title: 't', version: '1' } }),
    );

    expect(result).toEqual({
      hasPaths: false,
      generatedCount: 0,
      skippedCount: 0,
    });
  });

  it('counts paths whose path item is undefined as skipped', async () => {
    const result = await generatePaths(
      apiConfigNormalizer({
        swaggerJSONPath: 'x.json',
        output: path.join(tmpDir, 'apis'),
      }),
      makeState({
        openapi: '3.0.0',
        info: { title: 't', version: '1' },
        paths: { '/broken': null },
      }),
    );

    expect(result).toEqual({
      hasPaths: true,
      generatedCount: 0,
      skippedCount: 1,
    });
  });
});

describe('runCodeFormatter', () => {
  it('resolves true without running a command when none is configured', async () => {
    const config = apiConfigNormalizer({ swaggerJSONPath: 'x.json' });
    config.codeFormatterCmd = undefined;

    await expect(runCodeFormatter(config)).resolves.toBe(true);
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('resolves true when the configured command succeeds', async () => {
    spawnMock.mockImplementation(() => makeChild(0));

    const output = path.join(tmpDir, 'apis');
    const config = apiConfigNormalizer({
      swaggerJSONPath: 'x.json',
      output,
      codeFormatterCmd: 'fake-fmt',
    });

    await expect(runCodeFormatter(config)).resolves.toBe(true);
    expect(spawnMock).toHaveBeenCalledWith(
      'fake-fmt',
      [output],
      expect.objectContaining({ shell: false }),
    );
  });

  it('resolves false when the configured command fails', async () => {
    spawnMock.mockImplementation(() => makeChild(1));

    const config = apiConfigNormalizer({
      swaggerJSONPath: 'x.json',
      output: path.join(tmpDir, 'apis'),
      codeFormatterCmd: 'fake-fmt',
    });

    await expect(runCodeFormatter(config)).resolves.toBe(false);
  });

  it('resolves false when the configured command cannot be spawned', async () => {
    spawnMock.mockImplementation(() => {
      const child = new EventEmitter();
      queueMicrotask(() => child.emit('error', new Error('ENOENT')));
      return child;
    });

    const config = apiConfigNormalizer({
      swaggerJSONPath: 'x.json',
      output: path.join(tmpDir, 'apis'),
      codeFormatterCmd: 'missing-fmt',
    });

    await expect(runCodeFormatter(config)).resolves.toBe(false);
  });
});

describe('generateApi', () => {
  it('wipes the output directory, generates files and formatter runs once', async () => {
    const output = path.join(tmpDir, 'apis');
    await fs.mkdir(output, { recursive: true });
    const staleFile = path.join(output, 'stale.ts');
    await fs.writeFile(staleFile, 'stale');

    const swaggerPath = path.join(tmpDir, 'openapi.json');
    await fs.writeFile(swaggerPath, JSON.stringify(makeDoc()));

    const config = apiConfigNormalizer({
      swaggerJSONPath: swaggerPath,
      output,
      codeFormatterCmd: 'fake-fmt',
    });
    // 输出目录必须位于 config.cwd 内（resolveOutputDir 的包含性检查）
    vi.mocked(getConfig).mockResolvedValue({
      api: [config],
      cwd: tmpDir,
    } as never);
    vi.mocked(promptApiConfigEnable).mockResolvedValue([config]);
    spawnMock.mockImplementation(() => makeChild(0));

    await generateApi();

    await expect(fs.access(staleFile)).rejects.toThrow();
    await expect(
      fs.access(path.join(output, 'users_search', 'get.ts')),
    ).resolves.toBeUndefined();
    expect(spawnMock).toHaveBeenCalledTimes(1);
    expect(spawnMock.mock.calls[0][0]).toBe('fake-fmt');
    expect(spawnMock.mock.calls[0][1]).toEqual([output]);
  });
});
