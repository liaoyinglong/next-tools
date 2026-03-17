/**
 * fieldsMap 是一个通过 Proxy 实现的工具，
 * 用于在访问任意属性时返回属性名的字符串形式。
 *
 * 使用场景：
 *  - 在字段映射、动态生成键值等需要自动获取属性名的场景中，避免手动硬编码。
 */
export const fieldsMap: any =
  typeof Proxy === undefined
    ? (() => {
        console.error('Proxy is undefined, using empty object as fieldsMap');
        return {};
      })()
    : new Proxy(
        // 目标对象，这里使用一个空对象作为代理的基础
        {},
        {
          /**
           * 拦截对象的属性读取操作，并返回属性名的字符串形式。
           *
           * @param target 原始被代理的对象（此处为空对象）
           * @param p      被访问的属性名（可能是 string 或 symbol）
           * @param receiver Proxy 接收者
           * @returns 属性名的字符串表示
           */
          get(target, p, receiver) {
            return String(p);
          },
        },
      );

/**
 * FieldsMap 会将对象的所有键（包括嵌套对象中的键）拍平为单层结构，
 * 并将每个键映射为自身的字符串字面量类型。
 */
export type FieldsMap<T> = {
  [K in keyof UnionToIntersection<Pieces<T>>]-?: K;
};
// 联合 -> 交叉
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
      ? true
      : false
    : false;

type IncludesExact<Seen extends readonly unknown[], T> = Seen extends readonly [
  infer Head,
  ...infer Tail,
]
  ? IsEqual<Head, T> extends true
    ? true
    : IncludesExact<Tail, T>
  : false;

// 递归收集各层属性（保留原属性引用），数组下钻元素，忽略 undefined/null，遇到完全相同的类型时停止
type Pieces<T, Seen extends readonly unknown[] = []> =
  IncludesExact<Seen, T> extends true
    ? // 已经走过这一层，避免循环
      {}
    : T extends readonly (infer U)[]
      ? Pieces<U, Seen>
      : T extends object
        ? {
            // 保留原属性引用 + 下钻
            [K in keyof T]-?: Pick<T, K> & Pieces<T[K], [...Seen, T]>;
          }[keyof T]
        : {};
