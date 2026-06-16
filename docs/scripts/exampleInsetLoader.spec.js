import { describe, expect, it } from 'vitest';
import { replaceWithExample } from './exampleInsetLoader';

describe('exampleInsetLoader', () => {
  it('replaceWithExample should work', () => {
    expect(
      replaceWithExample(
        // language=HTML
        `<example-inset>
  ./examples/CreateStateContext
</example-inset>`,
        (match, p1) => `import CreateStateContext from "${p1}";`,
      ),
    ).toMatchInlineSnapshot(`
      "import CreateStateContext from "
        ./examples/CreateStateContext
      ";"
    `);
  });
});
