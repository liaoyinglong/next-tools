import { describe, expect, it } from "vitest";
// FIXME: has following error
// panicked at 'getrandom::getrandom() failed.: Error { internal_code: 2147483660, description: "Node.js crypto module is unavailable" }',
const { extract } = require("../");

const str = [
  "t`hello ${name}`",
  `t({ id: "t.fn.obj.arg", message: "Refresh inbox" })`,
  "<Trans>hello {name2}</Trans>",
  '<Trans id="msg_id1">hello {name2}</Trans>',
  '<Trans id={"msg_id2"}>hello {name2}</Trans>',
  "<Trans id={`msg_id3`}>hello {name2}</Trans>",
  "t(`hello ${name333}`)",
].join(";\n");

describe("extract", () => {
  it("extract correctly", async () => {
    const result = await extract(str, "test.jsx");
    expect(result.data.size).toMatchInlineSnapshot("6");
    expect(result.errMsg).toMatchInlineSnapshot(`
      "
        [36m>[0m msg id is not string literal, skip
         ,-[[36;1;4mtest.jsx[0m:6:1]
       [2m6[0m | <Trans id={\`msg_id3\`}>hello {name2}</Trans>;
       [2m7[0m | t(\`hello \${name333}\`)
         : [31;1m^^^^^^^^^^^^^^^^^^^^^[0m
         \`----
      "
    `);
    expect(result.filename).toMatchInlineSnapshot('"test.jsx"');

    const arr = Array.from(result.data.values()).sort((a: any, b: any) =>
      a.id.localeCompare(b.id)
    );
    expect(arr).toMatchInlineSnapshot(`
      [
        {
          "column": 0,
          "id": "hello {name}",
          "line": 1,
          "messages": "",
        },
        {
          "column": 0,
          "id": "hello {name2}",
          "line": 3,
          "messages": "",
        },
        {
          "column": 0,
          "id": "msg_id1",
          "line": 4,
          "messages": "hello {name2}",
        },
        {
          "column": 0,
          "id": "msg_id2",
          "line": 5,
          "messages": "hello {name2}",
        },
        {
          "column": 0,
          "id": "msg_id3",
          "line": 6,
          "messages": "hello {name2}",
        },
        {
          "column": 0,
          "id": "t.fn.obj.arg",
          "line": 2,
          "messages": "Refresh inbox",
        },
      ]
    `);
  });
});
