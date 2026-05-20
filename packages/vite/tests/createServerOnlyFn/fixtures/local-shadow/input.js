function createServerOnlyFn(fn) {
  return fn;
}

const a = createServerOnlyFn(() => 1);
