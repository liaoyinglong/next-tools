import { createIsomorphicFn } from 'stub';

export const f = createIsomorphicFn()
  .server(() => 1)
  .client(() => 2);
