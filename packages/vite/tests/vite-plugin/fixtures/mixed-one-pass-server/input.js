import { createIsomorphicFn, createClientOnlyFn } from 'stub';

export const run = createIsomorphicFn()
  .server(() => 'server')
  .client(() => 'client');

export const readWindow = createClientOnlyFn(() => window.location.href);
