import { describe } from 'vitest';
import { createIsomorphicFnPlugin } from '../../src/transforms/createIsomorphicFn';
import { fixtures } from '../run';

describe('createIsomorphicFn', async () => {
  await fixtures(__dirname, createIsomorphicFnPlugin);
});
