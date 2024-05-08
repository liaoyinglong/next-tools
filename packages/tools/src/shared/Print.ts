/**
 * Tell TS to evaluate an object type immediately. Actually does nothing, but
 * it's useful for debugging or make type information more readable.
 *
 * Sometimes strange things happen when you try to use it with a *generic type*,
 * so avoid that if possible.
 */
export type Print<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
