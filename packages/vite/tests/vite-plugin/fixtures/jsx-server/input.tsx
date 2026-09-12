import {
  createIsomorphicFn,
  createClientOnlyFn,
  createServerOnlyFn,
} from 'stub';

export const load = createServerOnlyFn(() => 'secret');

export const view = createIsomorphicFn()
  .server(() => <div>server</div>)
  .client(() => <span>client</span>);

export const open = createClientOnlyFn(() => <a href='#' />);
