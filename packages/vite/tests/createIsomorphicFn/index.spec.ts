import { describe } from 'vitest';
import { compileCreateIsomorphicFn } from '../../src/transforms/createIsomorphicFn';
import { fixtures } from '../run';

describe('createIsomorphicFn', async () => {
  await fixtures(__dirname, compileCreateIsomorphicFn);
});
