import { createClientOnlyFn } from 'stub';

export const readWindow = () => {
  throw new Error(
    'createClientOnlyFn() functions can only be called on the client!',
  );
};
