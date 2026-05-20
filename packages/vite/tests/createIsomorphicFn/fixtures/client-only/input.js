import { createIsomorphicFn } from 'stub';

export const log = createIsomorphicFn().client((m) =>
  console.log('client:', m),
);
