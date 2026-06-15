import { keepPreviousData } from '@tanstack/react-query';
import { assertType, describe, it } from 'vitest';
import { authOauthTokenPostApi } from './api';

describe('rq.query', () => {
  const req = {
    client_id: 'string',
    scope: 'string',
    grant_type: 'string',
    username: 'string',
    password: 'string',
    login_mode: 'string',
    attach: 'string',
  };

  it('options queryKey is partial', () => {
    authOauthTokenPostApi.useQuery(req, {
      enabled: true,
    });
    authOauthTokenPostApi.useSuspenseQuery(req, {
      staleTime: Infinity,
    });
    authOauthTokenPostApi.ensureQueryData(req, {
      staleTime: Infinity,
    });
    authOauthTokenPostApi.fetchQuery(req, {
      staleTime: Infinity,
    });
    authOauthTokenPostApi.prefetchQuery(req, {
      staleTime: Infinity,
    });
  });

  it('can pass meta', () => {
    authOauthTokenPostApi.useQuery(req, {
      enabled: true,
      meta: 'string',
    });
    authOauthTokenPostApi.useSuspenseQuery(req, {
      staleTime: Infinity,
      meta: 'string',
    });

    authOauthTokenPostApi.ensureQueryData(req, {
      staleTime: Infinity,
      meta: 'string',
    });
    authOauthTokenPostApi.fetchQuery(req, {
      staleTime: Infinity,
      meta: 'string',
    });
    authOauthTokenPostApi.prefetchQuery(req, {
      staleTime: Infinity,
      meta: 'string',
    });
  });

  it('use query return type', () => {
    {
      // 默认 res
      const res = authOauthTokenPostApi.useQuery(req);
      assertType<authOauthTokenPostApi.Res | undefined>(res.data);
    }
    {
      // suspense 下 data 一定存在
      const res = authOauthTokenPostApi.useSuspenseQuery(req);
      assertType<authOauthTokenPostApi.Res>(res.data);
    }
    {
      // 特殊 res
      type Res = {
        userId: number;
      };
      const res = authOauthTokenPostApi.useQuery<Res>(req, {
        select(data) {
          return {
            userId: data.userId,
          };
        },
      });
      assertType<Res | undefined>(res.data);
    }
    {
      // suspense 下支持 select 推导
      type Res = {
        userId: number;
      };
      const res = authOauthTokenPostApi.useSuspenseQuery<Res>(req, {
        select(data) {
          return {
            userId: data.userId,
          };
        },
      });
      assertType<Res>(res.data);
    }
    {
      // placeholderData: keepPreviousData - 默认泛型
      const res = authOauthTokenPostApi.useQuery(req, {
        placeholderData: keepPreviousData,
      });
      assertType<authOauthTokenPostApi.Res | undefined>(res.data);
    }
    {
      // placeholderData: keepPreviousData - 显式泛型
      const res = authOauthTokenPostApi.useQuery<authOauthTokenPostApi.Res>(
        req,
        {
          placeholderData: keepPreviousData,
        },
      );
      assertType<authOauthTokenPostApi.Res | undefined>(res.data);
    }
    {
      // placeholderData: keepPreviousData + select
      type Res = { userId: number };
      const res = authOauthTokenPostApi.useQuery<Res>(req, {
        placeholderData: keepPreviousData,
        select(data) {
          return { userId: data.userId };
        },
      });
      assertType<Res | undefined>(res.data);
    }
  });
});
