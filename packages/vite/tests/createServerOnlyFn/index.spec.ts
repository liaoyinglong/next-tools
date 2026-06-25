import { describe } from 'vitest';
import { createServerOnlyFnTransform } from '../../src/transforms/createServerOnlyFn';
import { compileTransform } from '../../src/transforms/shared';
import { fixtures } from '../run';

describe('createServerOnlyFn', async () => {
  await fixtures(__dirname, (code, filename) =>
    compileTransform(code, filename, createServerOnlyFnTransform),
  );
});
