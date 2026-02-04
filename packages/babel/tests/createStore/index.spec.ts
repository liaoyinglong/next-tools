import { describe } from 'vitest';
import { createStorePlugin } from '../../src/createStore';
import { fixtures } from '../run';

describe('zustand', async () => {
  await fixtures(__dirname, createStorePlugin);
});
