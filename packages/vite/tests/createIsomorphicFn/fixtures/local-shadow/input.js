function createIsomorphicFn() {
  return { server: (fn) => fn, client: (fn) => fn };
}

const log = createIsomorphicFn().server(() => 'server');
