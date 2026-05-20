import { createIsomorphicFn } from 'stub';

export const log = createIsomorphicFn()
  .server((m) => console.log('server:', m))
  .client((m) => console.log('client:', m));
