import { createIsomorphicFn } from 'stub';

export const log = createIsomorphicFn()
  .server((m) => console.log('s', m))
  .client((m) => console.log('c', m));
