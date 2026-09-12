import {
  createIsomorphicFn,
  createClientOnlyFn,
  createServerOnlyFn,
} from 'stub';

export const load = () => 'secret';

export const view = () => <div>server</div>;

export const open = () => {
  throw new Error(
    'createClientOnlyFn() functions can only be called on the client!',
  );
};
