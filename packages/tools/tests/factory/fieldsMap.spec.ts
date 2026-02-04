import { describe, expect, it } from 'vitest';
import { fieldsMap } from '../../src/factory/fieldsMap';

describe('fieldsMap', () => {
  it('应该返回访问的属性名的字符串形式', () => {
    expect(fieldsMap.foo).toBe('foo');
    expect(fieldsMap.bar).toBe('bar');
  });

  it('访问 symbol 属性时应返回 symbol 的字符串形式', () => {
    const sym = Symbol('test');
    expect(fieldsMap[sym]).toBe(sym.toString());
  });

  it('访问数字属性应返回数字的字符串形式', () => {
    expect(fieldsMap[123]).toBe('123');
  });

  it('应能在动态属性访问场景下正确工作', () => {
    const propertyName = 'dynamicKey';
    expect(fieldsMap[propertyName]).toBe(propertyName);
  });
});
