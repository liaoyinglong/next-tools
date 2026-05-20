import { describe } from 'vitest';
import { compileCreateServerOnlyFn } from '../../src/transforms/createServerOnlyFn';
import { fixtures } from '../run';

describe('createServerOnlyFn', async () => {
  await fixtures(__dirname, compileCreateServerOnlyFn);
});
