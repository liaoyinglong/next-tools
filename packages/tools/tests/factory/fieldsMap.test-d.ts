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
  });

  it('should flatten deep fields from optional nested array objects', () => {
    type Res = {
      id?: number;
      validationResult?: EfrValidationResultVO[];
      customerBalanceDetail?: CustomerBalanceDetailVO[];
      onboardingRecord?: UserOnboardingRecordResp[];
      eid?: string;
    };

    type EfrValidationResultVO = {
      identityCardValidationResult?: EftValidationFieldResult[];
      result?: EfrResultCodeObj;
    };

    type EftValidationFieldResult = {
      fileName?: string;
      value?: string;
      result?: string;
    };

    type EfrResultCodeObj = {
      code?: string;
      message?: string;
    };

    type CustomerBalanceDetailVO = {
      customerDocuments?: CustomerDocument[];
      balances?: BalanceVO[];
    };

    type CustomerDocument = {
      documentNumber?: string;
      documentType?: 'EID';
    };

    type BalanceVO = {
      availableBalance?: number;
      currencyCode?: string;
    };

    type UserOnboardingRecordResp = {
      creatorName?: string;
      createdTime?: string;
    };

    type Result = FieldsMap<Res>;

    assertType<Result['id']>('id');
    assertType<Result['eid']>('eid');
    assertType<Result['validationResult']>('validationResult');
    assertType<Result['fileName']>('fileName');
    assertType<Result['code']>('code');
    assertType<Result['documentNumber']>('documentNumber');
    assertType<Result['availableBalance']>('availableBalance');
    assertType<Result['creatorName']>('creatorName');

    // @ts-expect-error invalid key should not be allowed
    assertType<Result['unknownDeepField']>('unknownDeepField');
  });
});
