import { describe } from 'vitest';
import { createClientOnlyFnTransform } from '../../src/transforms/createClientOnlyFn';
import { compileTransform } from '../../src/transforms/shared';
import { fixtures } from '../run';

describe('createClientOnlyFn', async () => {
  await fixtures(__dirname, (code, filename) =>
    compileTransform(code, filename, createClientOnlyFnTransform),
  );
});
