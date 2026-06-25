import { describe } from 'vitest';
import { createIsomorphicFnTransform } from '../../src/transforms/createIsomorphicFn';
import { compileTransform } from '../../src/transforms/shared';
import { fixtures } from '../run';

describe('createIsomorphicFn', async () => {
  await fixtures(__dirname, (code, filename) =>
    compileTransform(code, filename, createIsomorphicFnTransform),
  );
});
