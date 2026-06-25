import { createServerOnlyFn } from 'stub';

export const getSecret = () => {
  throw new Error(
    'createServerOnlyFn() functions can only be called on the server!',
  );
};
