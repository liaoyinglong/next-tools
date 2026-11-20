import { describe, it } from 'vitest';
import { RequestBuilder } from '../../src/rq/RequestBuilder';

describe('rq.toRequest types', () => {
  it('accepts interface Req in toRequest: (query) => ({ query })', () => {
    interface Req {
      id: string;
      force?: boolean;
    }

    new RequestBuilder<Req, void>({
      url: '/v1/catalog/branch',
      method: 'delete',
      toRequest: (query) => ({ query }),
    });
  });

  it('accepts interface Req in destructured path / query / body patterns', () => {
    interface MixedReq {
      shopId: string;
      dryRun?: boolean;
      sku: string;
      count: number;
    }

    new RequestBuilder<MixedReq, void>({
      url: '/shops/{shopId}/orders',
      method: 'post',
      toRequest: ({ shopId, dryRun, ...body }) => ({
        path: { shopId },
        query: { dryRun },
        body,
      }),
    });

    interface DeleteWithPathReq {
      id: string;
      force?: boolean;
    }

    new RequestBuilder<DeleteWithPathReq, void>({
      url: '/items/{id}',
      method: 'delete',
      toRequest: ({ id, ...query }) => ({ path: { id }, query }),
    });

    interface WrappedBodyReq {
      id: string;
      body: string[];
    }

    new RequestBuilder<WrappedBodyReq, void>({
      url: '/items/{id}/tags',
      method: 'put',
      toRequest: ({ id, body }) => ({ path: { id }, body }),
    });
  });

  it('rejects primitive query in RequestParts', () => {
    new RequestBuilder<string, void>({
      url: '/items',
      method: 'post',
      // @ts-expect-error primitive string is not a valid query object
      toRequest: (query) => ({ query }),
    });
  });
});
