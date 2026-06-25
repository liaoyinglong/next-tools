import { createClientOnlyFn } from 'stub';

export const onlyClient = () => {
  throw new Error(
    'createClientOnlyFn() functions can only be called on the client!',
  );
};
