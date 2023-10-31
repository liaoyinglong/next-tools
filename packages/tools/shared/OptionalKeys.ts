// 可以忽略的key
export type _OptionalKeys<A extends object, B extends object> = {
  [K in keyof A]: undefined extends A[K] ? K : K extends keyof B ? K : never;
}[keyof A];

export type OptionalKeys<A extends object, B extends object> = NonNullable<
  _OptionalKeys<A, B>
>;
