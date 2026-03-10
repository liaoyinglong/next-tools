import { afterEach, describe, expect, it, vi } from 'vitest';

const { mockedUseSuspenseQuery } = vi.hoisted(() => ({
  mockedUseSuspenseQuery: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-query')>(
      '@tanstack/react-query',
    );

  return {
    ...actual,
    useSuspenseQuery: mockedUseSuspenseQuery,
  };
});

import { RequestBuilder } from '../../src/rq/RequestBuilder';

describe('rq.useSuspenseQuery', () => {
  afterEach(() => {
    mockedUseSuspenseQuery.mockReset();
  });

  it('merges suspense options and meta', () => {
    const requestFn = vi.fn();
    const result = { data: { access_token: 'token' } };
    mockedUseSuspenseQuery.mockReturnValue(result);

    const api = new RequestBuilder<
      { client_id: string },
      { access_token: string }
    >({
      url: '/v1/auth/oauth/token',
      method: 'post',
      meta: {
        source: 'builder',
      } as never,
      useSuspenseQueryOptions: {
        staleTime: 1_000,
      },
    });

    const res = api.useSuspenseQuery(
      { client_id: 'client-id' },
      {
        gcTime: 5_000,
        meta: {
          traceId: 'trace-id',
        } as never,
        requestFn,
      },
    );

    expect(res).toBe(result);
    expect(mockedUseSuspenseQuery).toHaveBeenCalledTimes(1);
    expect(mockedUseSuspenseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryFn: api.defaultQueryFn,
        queryKey: api.getQueryKey({ client_id: 'client-id' }),
        staleTime: 1_000,
        gcTime: 5_000,
        meta: {
          source: 'builder',
          traceId: 'trace-id',
          requestFn,
        },
      }),
    );
  });
});
