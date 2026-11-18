import type { OpenAPIV3 } from 'openapi-types';
import { describe, expect, it } from 'vitest';
import {
  asyncLocalStorage,
  generateApiRequestCode,
} from '../src/commands/generateApi';
import { compileEnumObject } from '../src/commands/generateApi/enumCompiler';
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

describe('enableEnums & compatibleNumberString', () => {
  const sampleOperation: OpenAPIV3.OperationObject = {
    tags: ['User'],
    summary: '更新用户',
    operationId: 'updateUser',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['id', 'status'],
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
              },
              status: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE'],
              },
              filter: {
                type: 'object',
                properties: {
                  role_type: {
                    type: 'string',
                    enum: ['ADMIN', 'MEMBER'],
                  },
                },
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    kind: {
                      type: 'string',
                      enum: ['PRIMARY', 'SECONDARY'],
                    },
                  },
                },
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
                audit_state: {
                  type: 'string',
                  enum: ['PENDING', 'APPROVED', 'REJECTED'],
                },
              },
            },
          },
        },
      },
    },
  };

  it('defaults enableEnums and compatibleNumberString to false', async () => {
    const code = await runWithOperation(sampleOperation);

    expect(code).not.toContain('ReqEnums');
    expect(code).not.toContain('ResEnums');
    expect(code).toContain('id: number;');
    expect(code).toContain('total?: number;');
  });

  it('generates flat top-level ReqEnums and ResEnums when enableEnums is true', async () => {
    const code = await runWithOperation(sampleOperation, {
      apiConfig: { enableEnums: true },
    });

    expect(code).toContain('export const apiUserPostApiReqEnums = {');
    expect(code).toContain('status: ["ACTIVE", "INACTIVE"],');
    expect(code).toContain('filterRoleType: ["ADMIN", "MEMBER"],');
    expect(code).toContain('itemsKind: ["PRIMARY", "SECONDARY"],');
    expect(code).toContain('} as const;');

    expect(code).toContain('export const apiUserPostApiResEnums = {');
    expect(code).toContain('auditState: ["PENDING", "APPROVED", "REJECTED"],');
  });

  it('supports enableEnums: { req: true } and { res: true } independently', async () => {
    const reqOnlyCode = await runWithOperation(sampleOperation, {
      apiConfig: { enableEnums: { req: true } },
    });
    expect(reqOnlyCode).toContain('export const apiUserPostApiReqEnums = {');
    expect(reqOnlyCode).not.toContain('ResEnums');

    const resOnlyCode = await runWithOperation(sampleOperation, {
      apiConfig: { enableEnums: { res: true } },
    });
    expect(resOnlyCode).not.toContain('ReqEnums');
    expect(resOnlyCode).toContain('export const apiUserPostApiResEnums = {');
  });

  it('skips ReqEnums / ResEnums when schema has no enums or enableTs is false', async () => {
    const noEnumCode = await runWithOperation(
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
        apiConfig: { enableEnums: true },
      },
    );
    expect(noEnumCode).not.toContain('ReqEnums');
    expect(noEnumCode).not.toContain('ResEnums');

    const jsModeCode = await runWithOperation(sampleOperation, {
      apiConfig: { enableTs: false, enableEnums: true },
    });
    expect(jsModeCode).not.toContain('ReqEnums');
    expect(jsModeCode).not.toContain('ResEnums');
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
        compatibleNumberString: { req: true },
      },
    });

    expect(reqOnlyCode).toContain('userId: number | string;');
    expect(reqOnlyCode).toContain('count?: number;');
    expect(
      sharedParsed.components.schemas.UserInput.properties.userId.type,
    ).toBe('integer');

    const bothCode = await runWithOperation(sampleOperation, {
      apiConfig: {
        compatibleNumberString: true,
      },
    });
    expect(bothCode).toContain('id: number | string;');
    expect(bothCode).toContain('total?: number | string;');
  });
});

describe('compileEnumObject edge cases', () => {
  it('resolves $ref, deduplicates identical collisions, disambiguates different collisions, and guards circular $ref', () => {
    const schema = {
      type: 'object',
      properties: {
        user_status: {
          $ref: '#/components/schemas/Status',
        },
        user: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['A', 'B', 'C'],
            },
          },
        },
        node: {
          $ref: '#/components/schemas/Node',
        },
      },
      components: {
        schemas: {
          Status: {
            type: 'string',
            enum: ['OPEN', 'CLOSED'],
          },
          Node: {
            type: 'object',
            properties: {
              kind: { type: 'string', enum: ['LEAF', 'BRANCH'] },
              next: { $ref: '#/components/schemas/Node' },
            },
          },
        },
      },
    };

    const result = compileEnumObject(schema);
    expect(result).toContain('userStatus: ["OPEN", "CLOSED"],');
    expect(result).toContain('userStatus2: ["A", "B", "C"],');
    expect(result).toContain('nodeKind: ["LEAF", "BRANCH"],');
  });
});
