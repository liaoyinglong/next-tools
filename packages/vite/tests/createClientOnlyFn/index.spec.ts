import { describe } from 'vitest';
import { compileCreateClientOnlyFn } from '../../src/transforms/createClientOnlyFn';
import { fixtures } from '../run';

describe('createClientOnlyFn', async () => {
  await fixtures(__dirname, compileCreateClientOnlyFn);
});
