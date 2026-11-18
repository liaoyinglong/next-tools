import type { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';
import {
  asyncLocalStorage,
  generateApiRequestCode,
} from '../src/commands/generateApi';
import { compileZodSchema } from '../src/commands/generateApi/zodCompiler';
import type { ApiConfig } from '../src/shared/config';
import { apiConfigNormalizer } from '../src/shared/config/normalizeConfig';

function runWithOperation(
  operationObject: OpenAPIV3.OperationObject,
  options: {
    url?: string;
    method?: string;
    apiConfig?: Partial<ApiConfig>;
    parsed?: Record<string, unknown>;
  } = {},
) {
  const apiConfig = apiConfigNormalizer({
    swaggerJSONPath: '',
    ...options.apiConfig,
  });
  const parsed = (options.parsed ?? {
    openapi: '3.0.1',
    paths: {},
  }) as never;

  return asyncLocalStorage.run(
    {
      parsed,
      parser: {
        $refs: {
          get: (ref: string) => {
            const parts = ref.replace(/^#\//, '').split('/');
            let cur: unknown = parsed;
            for (const part of parts) {
              cur = (cur as Record<string, unknown> | undefined)?.[part];
            }
            return cur;
          },
        },
      } as never,
    },
    () =>
      generateApiRequestCode({
        url: options.url ?? '/api/user',
        method: options.method ?? 'post',
        operationObject,
        apiConfig,
      }),
  );
}

describe('enableZod & compatibleNumberString', () => {
  const sampleOperation: OpenAPIV3.OperationObject = {
    tags: ['User'],
    summary: '更新用户',
    operationId: 'updateUser',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['id', 'name', 'status'],
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
                description: '用户 ID',
              },
              amount: {
                type: 'number',
                minimum: 0,
                description: '余额',
              },
              name: {
                type: 'string',
                minLength: 2,
                maxLength: 20,
                pattern: '^[a-zA-Z]+$',
                description: '用户名',
              },
              status: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE'],
                description: '状态',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                },
              },
            },
          },
        },
      },
    },
  };

  it('defaults enableZod and compatibleNumberString to false', async () => {
    const code = await runWithOperation(sampleOperation);

    expect(code).not.toContain("import { z } from 'zod';");
    expect(code).not.toContain('ReqSchema');
    expect(code).toContain('id: number;');
    expect(code).toContain('total?: number;');
  });

  it('generates top-level pure Zod v4 ReqSchema without .describe() when enableZod is true', async () => {
    const code = await runWithOperation(sampleOperation, {
      apiConfig: { enableZod: true },
    });

    expect(code).toContain("import { z } from 'zod';");
    expect(code).toContain(
      'export const apiUserPostApiReqSchema = /*#__PURE__*/ z.object({',
    );
    expect(code).toContain('satisfies z.ZodType<apiUserPostApi.Req>;');
    expect(code).not.toContain('.describe(');
    expect(code).toContain('id: z.number().int()');
    expect(code).toContain('amount: z.number().min(0).optional()');
    expect(code).toContain(
      'name: z.string().min(2).max(20).regex(new RegExp("^[a-zA-Z]+$"))',
    );
    expect(code).toContain('status: z.enum(["ACTIVE", "INACTIVE"])');
    expect(code).toContain('tags: z.array(z.string()).optional()');
  });

  it('skips ReqSchema and zod import when operation has no request parameters', async () => {
    const code = await runWithOperation(
      {
        summary: '获取列表',
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
      {
        url: '/api/ping',
        method: 'get',
        apiConfig: { enableZod: true },
      },
    );

    expect(code).not.toContain("import { z } from 'zod';");
    expect(code).not.toContain('ReqSchema');
  });

  it('does not generate zod schema when enableTs is false', async () => {
    const code = await runWithOperation(sampleOperation, {
      apiConfig: { enableTs: false, enableZod: true },
    });

    expect(code).not.toContain("import { z } from 'zod';");
    expect(code).not.toContain('ReqSchema');
  });

  it('supports compatibleNumberString: { req: true } without mutating Res or shared parsed refs', async () => {
    const sharedParsed = {
      openapi: '3.0.1',
      components: {
        schemas: {
          UserInput: {
            type: 'object',
            required: ['userId'],
            properties: {
              userId: { type: 'integer', format: 'int64' },
            },
          },
        },
      },
      paths: {},
    };

    const refOperation: OpenAPIV3.OperationObject = {
      summary: '引用参数测试',
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserInput' },
          },
        },
      },
      responses: {
        '200': {
          description: 'OK',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    };

    const reqOnlyCode = await runWithOperation(refOperation, {
      parsed: sharedParsed,
      apiConfig: {
        enableZod: true,
        compatibleNumberString: { req: true },
      },
    });

    expect(reqOnlyCode).toContain('userId: number | string;');
    expect(reqOnlyCode).toContain('count?: number;');
    expect(reqOnlyCode).toContain(
      'userId: z.union([z.number().int(), z.string().regex(/^-?\\d+$/)])',
    );
    // 确保共享的 parsed 未被污染
    expect(
      sharedParsed.components.schemas.UserInput.properties.userId.type,
    ).toBe('integer');

    const bothCode = await runWithOperation(sampleOperation, {
      apiConfig: {
        enableZod: true,
        compatibleNumberString: true,
      },
    });
    expect(bothCode).toContain('id: number | string;');
    expect(bothCode).toContain('total?: number | string;');
    expect(bothCode).toContain(
      'amount: z.union([z.number().min(0), z.string().regex(/^-?\\d+(\\.\\d+)?$/)]).optional()',
    );
  });
});

describe('compileZodSchema edge cases', () => {
  it('handles nullable, oneOf, allOf, record, and circular $ref safely', () => {
    const schema = {
      type: 'object',
      required: ['unionField', 'intersectionField', 'dict', 'self'],
      properties: {
        unionField: {
          oneOf: [{ type: 'string' }, { type: 'boolean' }],
          nullable: true,
        },
        intersectionField: {
          allOf: [
            {
              type: 'object',
              required: ['a'],
              properties: { a: { type: 'string' } },
            },
            { type: 'object', properties: { b: { type: 'number' } } },
          ],
        },
        dict: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
        emptyObj: {
          type: 'object',
        },
        self: {
          $ref: '#/components/schemas/Node',
        },
      },
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              next: { $ref: '#/components/schemas/Node' },
            },
          },
        },
      },
    };

    const result = compileZodSchema(schema);
    expect(result?.code).toContain(
      'unionField: z.union([z.string(), z.boolean()]).nullable()',
    );
    expect(result?.code).toContain('z.intersection(');
    expect(result?.code).toContain('dict: z.record(z.string(), z.string())');
    expect(result?.code).toContain(
      'emptyObj: z.record(z.string(), z.unknown()).optional()',
    );
    expect(result?.code).toContain('next: z.any().optional()');
  });

  it('extracts local pure compat helper constants when repeated >= 2 times', async () => {
    const repeatedOp: OpenAPIV3.OperationObject = {
      summary: '多数字字段请求',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id', 'orgId'],
              properties: {
                id: { type: 'integer', format: 'int64' },
                orgId: { type: 'integer', format: 'int64' },
                minAmount: { type: 'number', minimum: 0 },
                maxAmount: { type: 'number', minimum: 1 },
              },
            },
          },
        },
      },
      responses: { '200': { description: 'OK' } },
    };

    const code = await runWithOperation(repeatedOp, {
      apiConfig: {
        enableZod: true,
        compatibleNumberString: { req: true },
      },
    });

    expect(code).toContain(
      'const _z0 = /*#__PURE__*/ z.string().regex(/^-?\\d+(\\.\\d+)?$/);',
    );
    expect(code).toContain(
      'const _z1 = /*#__PURE__*/ z.union([z.number().int(), z.string().regex(/^-?\\d+$/)]);',
    );
    expect(code).toContain('id: _z1');
    expect(code).toContain('orgId: _z1');
    expect(code).toContain(
      'minAmount: z.union([z.number().min(0), _z0]).optional()',
    );
    expect(code).toContain(
      'maxAmount: z.union([z.number().min(1), _z0]).optional()',
    );
  });

  it('extracts _intString when unconstrained and constrained integers appear together (e.g. pageNum + pageSize)', async () => {
    const paginatedOp: OpenAPIV3.OperationObject = {
      summary: '分页查询',
      parameters: [
        {
          name: 'pageNum',
          in: 'query',
          schema: { type: 'integer' },
        },
        {
          name: 'pageSize',
          in: 'query',
          schema: { type: 'integer', maximum: 100 },
        },
      ],
      responses: { '200': { description: 'OK' } },
    };

    const code = await runWithOperation(paginatedOp, {
      method: 'get',
      apiConfig: {
        enableZod: true,
        compatibleNumberString: { req: true },
      },
    });

    expect(code).toContain(
      'const _z0 = /*#__PURE__*/ z.string().regex(/^-?\\d+$/);',
    );
    expect(code).toContain(
      'pageNum: z.union([z.number().int(), _z0]).optional()',
    );
    expect(code).toContain(
      'pageSize: z.union([z.number().int().max(100), _z0]).optional()',
    );
    expect(code.match(/regex\(\/\^-\?\\d\+\$\/\)/g)).toHaveLength(1);
  });

  it('extracts outermost repeated expressions including .optional() and arbitrary schemas', async () => {
    const productOp: OpenAPIV3.OperationObject = {
      summary: '创建商品',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['primaryStatus'],
              properties: {
                weight: { type: 'number', minimum: 0 },
                length: { type: 'number', minimum: 0 },
                height: { type: 'number', minimum: 0 },
                width: { type: 'number', minimum: 0 },
                primaryStatus: { type: 'string', enum: ['ON', 'OFF'] },
                backupStatus: { type: 'string', enum: ['ON', 'OFF'] },
                fallbackStatus: { type: 'string', enum: ['ON', 'OFF'] },
              },
            },
          },
        },
      },
      responses: { '200': { description: 'OK' } },
    };

    const code = await runWithOperation(productOp, {
      apiConfig: {
        enableZod: true,
        compatibleNumberString: { req: true },
      },
    });

    expect(code).toContain(
      'const _z2 = /*#__PURE__*/ z.union([z.number().min(0), z.string().regex(/^-?\\d+(\\.\\d+)?$/)]).optional();',
    );
    expect(code).toContain('weight: _z2');
    expect(code).toContain('length: _z2');
    expect(code).toContain('height: _z2');
    expect(code).toContain('width: _z2');

    expect(code).toContain('const _z0 = /*#__PURE__*/ z.enum(["ON", "OFF"]);');
    expect(code).toContain('const _z1 = /*#__PURE__*/ _z0.optional();');
    expect(code).toContain('primaryStatus: _z0');
    expect(code).toContain('backupStatus: _z1');
    expect(code).toContain('fallbackStatus: _z1');
  });

  it('converts leading PCRE inline flags like (?i) to JS RegExp flags and skips invalid JS patterns', () => {
    const schema = {
      type: 'object',
      required: ['currency', 'broken'],
      properties: {
        currency: {
          type: 'string',
          pattern: '(?i)aed',
        },
        broken: {
          type: 'string',
          pattern: '(?u)[unclosed',
        },
      },
    };

    const result = compileZodSchema(schema);
    expect(result?.code).toContain(
      'currency: z.string().regex(new RegExp("aed", "i"))',
    );
    expect(result?.code).toContain('broken: z.string()');
    expect(result?.code).not.toContain('(?i)');
    expect(result?.code).not.toContain('(?u)');
  });
});
