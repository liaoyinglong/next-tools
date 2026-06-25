import { createClientOnlyFn } from 'stub';

export const readWindow = createClientOnlyFn(() => window.location.href);
