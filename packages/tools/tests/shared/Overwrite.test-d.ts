import { assertType, describe, it } from 'vitest';
import type { Overwrite } from '../../src/shared/Overwrite';

describe('Overwrite', () => {
  it('should be ok', () => {
    type A = {
      name: string;
      age: number;
      work?: string;
    };
    type B = {
      name: number;
    };
    type C = Overwrite<A, B>;
    //   ^? { name: number; age: number; work?: string; }

    assertType<C>({ name: 1, age: 1, work: '1' });
  });
});
