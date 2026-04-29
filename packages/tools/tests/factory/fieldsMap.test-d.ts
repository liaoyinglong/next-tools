import { assertType, describe, it } from 'vitest';
import type { FieldsMap } from '../../src/factory/fieldsMap';

describe('FieldsMap', () => {
  it('should map keys to string literal of themselves', () => {
    type Person = { name: string; age: number; work?: string };
    type Result = FieldsMap<Person>;

    assertType<Result['name']>('name');
    assertType<Result['age']>('age');
    assertType<Result['work']>('work');

    // @ts-expect-error invalid key should not be allowed
    assertType<Result['unknown']>('unknown');
    it('should flatten nested object keys', () => {
      type Data = {
        id: number;
        profile: {
          name: string;
          address: {
            city: string;
            zipcode: number;
          };
        };
      };
      type Result = FieldsMap<Data>;

      assertType<Result['id']>('id');
      assertType<Result['name']>('name');
      assertType<Result['city']>('city');
      assertType<Result['zipcode']>('zipcode');
      assertType<Result['profile']>('profile');

      //@ts-expect-error invalid key should not be allowed
      assertType<Result['profile1']>('profile1');
    });
  });

  it('should support optional-only types', () => {
    type OptionalOnly = { work?: string };
    type Result = FieldsMap<OptionalOnly>;

    assertType<Result['work']>('work');
    // @ts-expect-error invalid key
    assertType<Result['name']>('name');
  });

  it('should be never for non-record types', () => {
    type NotRecord = string;
    type Result = FieldsMap<NotRecord>;
    // @ts-expect-error Result is never type, so cannot be indexed
    assertType<Result['name']>('name');
  });
  it('should handle recursive array shapes without infinite recursion', () => {
    type Item = {
      name: string;
      age: number;
      /**
       * 12312
       */
      metadata?: {
        [k: string]: any;
      };
      children?: Item[];
    };
    type Result = FieldsMap<Item[]>;

    assertType<Result['name']>('name');
    assertType<Result['age']>('age');
    assertType<Result['metadata']>('metadata');
    assertType<Result['children']>('children');

    // @ts-expect-error invalid key should not be allowed
    assertType<Result['unknownField']>('unknownField');
  });

  it('should keep flattening nested array item fields when root shares optional keys', () => {
    type Res = {
      id?: number;
      userId?: number;
      onboardingRecord?: UserOnboardingRecordResp[];
    };

    type UserOnboardingRecordResp = {
      // 这里故意和 Res 共享可选字段。
      // 旧实现用 `T extends Seen[number]` 做循环检测时，
      // 会因为结构兼容把这个类型误判成已经访问过，从而丢掉 `action`。
      id?: number;
      userId?: number;
      action?: 'RESET_APP_KYC' | 'APPROVE_KYC';
    };

    type Result = FieldsMap<Res>;

    assertType<Result['id']>('id');
    assertType<Result['userId']>('userId');
    assertType<Result['onboardingRecord']>('onboardingRecord');
    assertType<Result['action']>('action');

    // @ts-expect-error invalid key should not be allowed
    assertType<Result['unknownDeepField']>('unknownDeepField');
  });
});
