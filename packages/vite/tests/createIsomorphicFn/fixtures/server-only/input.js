import { createIsomorphicFn } from 'stub';

export const log = createIsomorphicFn().server((m) =>
  console.log('server:', m),
);
