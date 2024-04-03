import assert from "node:assert";
import path from "node:path";
import { it } from "node:test";
import { fileURLToPath } from "node:url";
import { fs, glob } from "zx";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const out = path.resolve(__dirname, "out");

async function readOutLangFile(p) {
  const content = await fs.readFile(path.resolve(out, p), "utf-8");
  return content;
}

it("en correct", async () => {
  {
    const str = await readOutLangFile("en.html");
    assert.ok(str.includes("<h1>hello</h1><h2>hello world</h2>"));
  }
  {
    const str = await readOutLangFile("en.txt");
    assert.ok(str.includes(`"children":"hello"`));
    assert.ok(str.includes(`"children":"hello world"`));
  }
});
it("zh correct", async () => {
  {
    const str = await readOutLangFile("zh.html");
    assert.ok(str.includes("<h1>你好</h1><h2>你好 world</h2>"));
  }
  {
    const str = await readOutLangFile("zh.txt");
    assert.ok(str.includes(`"children":"你好"`));
    assert.ok(str.includes(`"children":"你好 world"`));
  }
});

it("js chunk not have i18n", async () => {
  // find all out js chunk
  const chunks = await glob(`${out}/**/*.js`);
  await Promise.all(
    chunks.map(async (p) => {
      const str = await fs.readFile(p, "utf-8");
      assert.ok(!str.includes("hello"));
      assert.ok(!str.includes("hello world"));
      assert.ok(!str.includes("你好"));
      assert.ok(!str.includes("你好 world"));
    }),
  );
});
