import { describe } from 'vitest';
import { createServerOnlyFnPlugin } from '../../src/transforms/createServerOnlyFn';
import { fixtures } from '../run';

describe('createServerOnlyFn', async () => {
  await fixtures(__dirname, createServerOnlyFnPlugin);
});
