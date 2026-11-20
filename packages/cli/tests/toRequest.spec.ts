import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { OpenAPIV3 } from 'openapi-types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  generateApiRequestCode,
  generatePaths,
} from '../src/commands/generateApi';
import { apiConfigNormalizer } from '../src/shared/config/normalizeConfig';

const okResponse: OpenAPIV3.ResponsesObject = {
  '200': {
    description: 'OK',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'boolean' },
          },
        },
      },
    },
  },
};

function gen(options: {
  url: string;
  method: string;
  operationObject: Partial<OpenAPIV3.OperationObject>;
  pathItemParameters?: OpenAPIV3.ParameterObject[];
}) {
  return generateApiRequestCode({
    url: options.url,
    method: options.method,
    pathItemParameters: options.pathItemParameters,
    operationObject: {
      responses: okResponse,
      ...options.operationObject,
    } as OpenAPIV3.OperationObject,
    apiConfig: apiConfigNormalizer({
      swaggerJSONPath: '',
      swaggerUiUrl: '',
    }),
  });
}

describe('codegen: toRequest 生成与省略规则', () => {
  describe('符合默认规则时省略 toRequest', () => {
    it('GET + path + query 省略 toRequest', async () => {
      const code = await gen({
        url: '/items/{id}',
        method: 'get',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
        },
      });

      expect(code).not.toContain('toRequest');
      expect(code).not.toContain('urlPathParams');
      expect(code).toContain('id: string');
      expect(code).toContain('page?: number');
    });

    it('PUT + path + object body 省略 toRequest', async () => {
      const code = await gen({
        url: '/items/{id}',
        method: 'put',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: { name: { type: 'string' } },
                },
              },
            },
          },
        },
      });

      expect(code).not.toContain('toRequest');
      expect(code).toContain('id: string');
      expect(code).toContain('name: string');
    });

    it('POST + 数组 body（无 path / query）省略 toRequest', async () => {
      const code = await gen({
        url: '/items/batch',
        method: 'post',
        operationObject: {
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      });

      expect(code).not.toContain('toRequest');
      expect(code).toContain('export type Req = string[];');
    });

    it('DELETE + 只有 path（无 query / body）省略 toRequest', async () => {
      const code = await gen({
        url: '/items/{id}',
        method: 'delete',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
        },
      });

      expect(code).not.toContain('toRequest');
    });
  });

  describe('不符合默认规则时生成 toRequest', () => {
    it('DELETE + path + query 生成 rest query 映射', async () => {
      const code = await gen({
        url: '/items/{id}',
        method: 'delete',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            { name: 'force', in: 'query', schema: { type: 'boolean' } },
          ],
        },
      });

      expect(code).toContain(
        'toRequest: ({ id, ...query }) => ({ path: { id }, query }),',
      );
    });

    it('POST + 只有 query（无 path / body）生成 (query) => ({ query })', async () => {
      const code = await gen({
        url: '/items/reindex',
        method: 'post',
        operationObject: {
          parameters: [
            { name: 'dryRun', in: 'query', schema: { type: 'boolean' } },
          ],
        },
      });

      expect(code).toContain('toRequest: (query) => ({ query }),');
    });

    it('POST + path + query + object body 混合映射', async () => {
      const code = await gen({
        url: '/shops/{shopId}/orders',
        method: 'post',
        operationObject: {
          parameters: [
            {
              name: 'shopId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            { name: 'dryRun', in: 'query', schema: { type: 'boolean' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sku', 'count'],
                  properties: {
                    sku: { type: 'string' },
                    count: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ shopId, dryRun, ...body }) => ({ path: { shopId }, query: { dryRun }, body }),',
      );
      expect(code).toContain('shopId: string');
      expect(code).toContain('dryRun?: boolean');
      expect(code).toContain('sku: string');
      expect(code).toContain('count: number');
    });
  });

  describe('wrapped body（数组、原始值、组合 schema、multipart）', () => {
    it('PUT + path + 数组 body 生成 body 字段与解构', async () => {
      const code = await gen({
        url: '/items/{id}/tags',
        method: 'put',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ id, body }) => ({ path: { id }, body }),',
      );
      expect(code).toContain('id: string');
      expect(code).toContain('body: string[]');
    });

    it('POST + query + 原始值 body 生成 body 字段', async () => {
      const code = await gen({
        url: '/notes',
        method: 'post',
        operationObject: {
          parameters: [
            { name: 'tag', in: 'query', schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'string' },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ tag, body }) => ({ query: { tag }, body }),',
      );
      expect(code).toContain('tag?: string');
      expect(code).toContain('body: string');
    });

    it('POST + path + 组合 schema（oneOf）body 生成 body 字段', async () => {
      const code = await gen({
        url: '/items/{id}/payload',
        method: 'post',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      required: ['a'],
                      properties: { a: { type: 'string' } },
                    },
                    {
                      type: 'object',
                      required: ['b'],
                      properties: { b: { type: 'number' } },
                    },
                  ],
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ id, body }) => ({ path: { id }, body }),',
      );
      expect(code).toContain('id: string');
      expect(code).toContain('body:');
    });

    it('POST + path + query + multipart/form-data 生成 body: FormData', async () => {
      const code = await gen({
        url: '/items/{id}/avatar',
        method: 'post',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            { name: 'overwrite', in: 'query', schema: { type: 'boolean' } },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: { file: { type: 'string', format: 'binary' } },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ id, overwrite, body }) => ({ path: { id }, query: { overwrite }, body }),',
      );
      expect(code).toContain('id: string');
      expect(code).toContain('overwrite?: boolean');
      expect(code).toContain('body: FormData');
    });

    it('纯 multipart/form-data（无 path / query）省略 toRequest 且 Req = FormData', async () => {
      const code = await gen({
        url: '/upload',
        method: 'post',
        operationObject: {
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: { type: 'object' },
              },
            },
          },
        },
      });

      expect(code).not.toContain('toRequest');
      expect(code).toContain('export type Req = FormData;');
    });

    it('仅有 additionalProperties 的字典型 object body 与 path 共存时归为 wrapped body', async () => {
      const code = await gen({
        url: '/items/{id}/meta',
        method: 'put',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ id, body }) => ({ path: { id }, body }),',
      );
      expect(code).toContain('id: string');
      expect(code).toContain('body: Record<string, string>');
    });
  });

  describe('path-item 参数继承与 operation 覆盖', () => {
    it('继承 path-item 参数并允许 operation 覆盖同名同位置参数', async () => {
      const code = await gen({
        url: '/tenants/{tenantId}/items',
        method: 'post',
        pathItemParameters: [
          {
            name: 'tenantId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'dryRun',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        operationObject: {
          parameters: [
            {
              name: 'dryRun',
              in: 'query',
              required: true,
              schema: { type: 'boolean' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: { name: { type: 'string' } },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ tenantId, dryRun, ...body }) => ({ path: { tenantId }, query: { dryRun }, body }),',
      );
      expect(code).toContain('tenantId: string');
      expect(code).toContain('dryRun: boolean');
      expect(code).not.toContain('dryRun?: string');
    });
  });

  describe('query object 拍平与 deepObject 保留', () => {
    it('普通 object query 拍平，deepObject query 保留具名对象', async () => {
      const code = await gen({
        url: '/search',
        method: 'post',
        operationObject: {
          parameters: [
            {
              name: 'flat',
              in: 'query',
              schema: {
                type: 'object',
                required: ['keyword'],
                properties: { keyword: { type: 'string' } },
              },
            },
            {
              name: 'filter',
              in: 'query',
              style: 'deepObject',
              required: true,
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string' } },
              },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { note: { type: 'string' } },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ keyword, filter, ...body }) => ({ query: { keyword, filter }, body }),',
      );
      expect(code).toContain('keyword: string');
      expect(code).toContain('filter: {');
      expect(code).toContain('status: string');
      expect(code).not.toContain('flat:');
    });

    it('object query 拍平后与其他 query 重名时抛错', async () => {
      await expect(
        gen({
          url: '/search',
          method: 'post',
          operationObject: {
            parameters: [
              {
                name: 'flat',
                in: 'query',
                schema: {
                  type: 'object',
                  properties: { keyword: { type: 'string' } },
                },
              },
              { name: 'keyword', in: 'query', schema: { type: 'string' } },
            ],
          },
        }),
      ).rejects.toThrow(
        'Duplicate query parameter name after flattening: "keyword"',
      );
    });
  });

  describe('字段重名与非法 JS 标识符', () => {
    it('path 与 body 重名时 path 改名为 pathXxx 并生成改名映射', async () => {
      const code = await gen({
        url: '/users/{id}',
        method: 'patch',
        operationObject: {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        'toRequest: ({ pathId, ...body }) => ({ path: { id: pathId }, body }),',
      );
      expect(code).toContain('pathId: string');
      expect(code).toContain('id: string');
    });

    it('改名后仍冲突时抛错', async () => {
      await expect(
        gen({
          url: '/users/{id}',
          method: 'patch',
          operationObject: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      pathId: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        }),
      ).rejects.toThrow('Parameter name conflict for path "id"');
    });

    it('query 与 body 重名时抛错', async () => {
      await expect(
        gen({
          url: '/users',
          method: 'post',
          operationObject: {
            parameters: [
              { name: 'name', in: 'query', schema: { type: 'string' } },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { name: { type: 'string' } },
                  },
                },
              },
            },
          },
        }),
      ).rejects.toThrow(
        'Parameter name conflict between query and body: "name"',
      );
    });

    it('非法 JS 标识符字段名生成重命名解构，并在 camelCase 冲突时加数字后缀', async () => {
      const code = await gen({
        url: '/users/{user-id}',
        method: 'post',
        operationObject: {
          parameters: [
            {
              name: 'user-id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            { name: 'userId', in: 'query', schema: { type: 'string' } },
            { name: 'page-size', in: 'query', schema: { type: 'integer' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { name: { type: 'string' } },
                },
              },
            },
          },
        },
      });

      expect(code).toContain(
        "toRequest: ({ 'user-id': userId2, userId, 'page-size': pageSize, ...body }) => ({ path: { 'user-id': userId2 }, query: { userId, 'page-size': pageSize }, body }),",
      );
    });
  });

  describe('generatePaths 集成：冲突接口按接口跳过', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dune-to-request-'));
    });

    afterEach(async () => {
      await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it('冲突接口跳过并计数，同一文档中其他接口正常生成（含 path-item 继承）', async () => {
      const output = path.join(tmpDir, 'apis');
      const doc: OpenAPIV3.Document = {
        openapi: '3.0.0',
        info: { title: 'test', version: '1.0.0' },
        paths: {
          '/items/{id}': {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
            ],
            delete: {
              parameters: [
                { name: 'force', in: 'query', schema: { type: 'boolean' } },
              ],
              responses: okResponse,
            },
            post: {
              parameters: [
                { name: 'dup', in: 'query', schema: { type: 'string' } },
              ],
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: { dup: { type: 'string' } },
                    },
                  },
                },
              },
              responses: okResponse,
            },
          },
        },
      };

      const result = await generatePaths(
        apiConfigNormalizer({ swaggerJSONPath: 'x.json', output }),
        { parsed: doc, parser: { $refs: new Map() } } as never,
      );

      expect(result).toEqual({
        hasPaths: true,
        generatedCount: 1,
        skippedCount: 1,
      });

      const deleteCode = await fs.readFile(
        path.join(output, 'items', '{id}', 'delete.ts'),
        'utf8',
      );
      expect(deleteCode).toContain(
        'toRequest: ({ id, ...query }) => ({ path: { id }, query }),',
      );
    });
  });
});
