import { describe, expect, it } from 'vitest';
import { compileCreateServerFn } from '../src/transforms/createServerFn';

describe('createServerFn', () => {
  it('throws on bare createServerFn() call', () => {
    expect(() =>
      compileCreateServerFn(
        `import { createServerFn } from '@tanstack/react-start';\nconst fn = createServerFn();`,
        'test.ts',
      ),
    ).toThrow(/createServerFn\(\) is not supported/);
  });

  it('throws on createServerFn().handler(fn) chain', () => {
    expect(() =>
      compileCreateServerFn(
        `import { createServerFn } from '@tanstack/react-start';\nconst fn = createServerFn().handler(async () => 1);`,
        'test.ts',
      ),
    ).toThrow(/createServerFn\(\) is not supported/);
  });

  it('does not throw when no createServerFn call is present', () => {
    const code = `import { createServerFn } from '@tanstack/react-start';\nconsole.log(typeof createServerFn);`;
    expect(() => compileCreateServerFn(code, 'test.ts')).not.toThrow();
  });
});
