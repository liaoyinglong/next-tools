import { describe, expect, it } from 'vitest';
import { dune2Vite } from '../src/index';

describe('@dune2/vite transform sourcemap', () => {
  it('generates a sourcemap for files with non-ascii content', async () => {
    // 中日文注释、全角空格和 emoji（代理对）都在编辑点之前，
    // 确保 ast-grep 字节偏移 → MagicString UTF-16 索引的换算被真实执行。
    // 插件内部用 MagicString 重放结果与 commitEdits 产物做自校验，
    // 换算一旦出错，map 会退化为 null，此断言即失败。
    const code = [
      '// 中文注释：文件开头，用于制造非 ASCII 字节偏移',
      '// 日本語のコメント　全角空白　🎉 emoji',
      "import { createServerOnlyFn } from 'stub';",
      '',
      'export const getSecret = createServerOnlyFn(() => "secret-token");',
      '// 末尾注释：この行も UTF-8 マルチバイトを含む',
    ].join('\n');

    const plugin = dune2Vite();
    const transform = plugin.transform as any;
    const result = await transform.handler.call({}, code, '/abs/path/中文.ts');

    expect(result).toBeTruthy();
    expect(result.map).toBeTruthy();
    expect(result.map.sources[0]).toBe('/abs/path/中文.ts');
    expect(result.map.mappings.length).toBeGreaterThan(0);
    expect(result.code).toContain(
      'export const getSecret = () => "secret-token";',
    );
  });

  it('generates a sourcemap for plain ascii files', async () => {
    const code = [
      "import { createServerOnlyFn } from 'stub';",
      '',
      'export const getSecret = createServerOnlyFn(() => "secret-token");',
    ].join('\n');

    const plugin = dune2Vite();
    const transform = plugin.transform as any;
    const result = await transform.handler.call({}, code, '/abs/path/ascii.ts');

    expect(result).toBeTruthy();
    expect(result.map).toBeTruthy();
    expect(result.map.mappings.length).toBeGreaterThan(0);
  });
});
