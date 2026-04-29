/**
 * fieldsMap 是一个通过 Proxy 实现的工具，
 * 用于在访问任意属性时返回属性名的字符串形式。
 *
 * 使用场景：
 *  - 在字段映射、动态生成键值等需要自动获取属性名的场景中，避免手动硬编码。
 */
export const fieldsMap: any =
  typeof Proxy === 'undefined'
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
  [K in FlattenFieldKeys<T>]-?: K;
};

// 联合 -> 交叉
type UnionToIntersection<T> = (T extends any ? (x: T) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

// 类型层面的精确相等判断，避免把"结构兼容"误判为同一个类型
type IsExactlyEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
      ? true
      : false
    : false;

type HasSeenExact<Seen extends readonly unknown[], T> = Seen extends readonly [
  infer Head,
  ...infer Tail,
]
  ? IsExactlyEqual<Head, T> extends true
    ? true
    : HasSeenExact<Tail, T>
  : false;

// index signature 检测：string 或 number 可赋值给 keyof T 时说明存在索引签名
type HasIndexSignature<T> = string extends keyof T
  ? true
  : number extends keyof T
    ? true
    : false;

// 递归收集各层字段片段：
// 1. 数组下钻到元素类型
// 2. 对象既保留当前层字段，也继续下钻
// 3. 只有遇到"完全相同"的类型时才停止，避免把结构兼容误判成循环
// 4. 带 index signature 的对象：跳过当前层宽键，但继续递归 value 类型
// 提取 index signature 的 value 类型
type IndexSignatureValue<T> = T extends Record<string, infer V> ? V : never;

type CollectFieldPieces<T, Seen extends readonly unknown[] = []> =
  HasSeenExact<Seen, T> extends true
    ? {}
    : T extends readonly (infer U)[]
      ? CollectFieldPieces<U, Seen>
      : T extends object
        ? HasIndexSignature<T> extends true
          ? CollectFieldPieces<IndexSignatureValue<T>, [...Seen, T]>
          : {
              [K in keyof T]-?: Pick<T, K> &
                CollectFieldPieces<T[K], [...Seen, T]>;
            }[keyof T]
        : {};

type FlattenFieldKeys<T> = keyof UnionToIntersection<CollectFieldPieces<T>>;
