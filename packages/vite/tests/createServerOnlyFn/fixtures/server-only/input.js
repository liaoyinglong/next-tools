import { createServerOnlyFn } from 'stub';

export const getSecret = createServerOnlyFn(() => 'secret-token');
