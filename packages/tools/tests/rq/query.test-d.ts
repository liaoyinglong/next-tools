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
      // select 自动推导: data 是 API 原始类型, 返回值自动推导
      const res = authOauthTokenPostApi.useQuery(req, {
        select(data) {
          assertType<authOauthTokenPostApi.Res>(data);
          return {
            userId: data.userId,
          };
        },
      });
      assertType<{ userId: string } | undefined>(res.data);
    }
    {
      // suspense 下支持 select 推导
      const res = authOauthTokenPostApi.useSuspenseQuery(req, {
        select(data) {
          assertType<authOauthTokenPostApi.Res>(data);
          return {
            userId: data.userId,
          };
        },
      });
      assertType<{ userId: string }>(res.data);
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
      const res = authOauthTokenPostApi.useQuery(req, {
        placeholderData: keepPreviousData,
        select(data) {
          assertType<authOauthTokenPostApi.Res>(data);
          return { userId: data.userId };
        },
      });
      assertType<{ userId: string } | undefined>(res.data);
    }
  });
});
