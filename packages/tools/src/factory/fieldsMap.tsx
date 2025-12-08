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
        console.error("Proxy is undefined, using empty object as fieldsMap");
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

export type FieldsMap<T> =
  T extends Record<string, any>
    ? {
        [K in keyof T]: K;
      }
    : never;
