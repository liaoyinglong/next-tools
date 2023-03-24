import { describe, it, expect } from "vitest";
import { extract } from "..";

const str = [
  "t`hello ${name}`",
  `t({ id: "t.fn.obj.arg", message: "Refresh inbox" })`,
  "<Trans>hello {name2}</Trans>",
  '<Trans id="msg_id1">hello {name2}</Trans>',
  '<Trans id={"msg_id2"}>hello {name2}</Trans>',
  "<Trans id={`msg_id3`}>hello {name2}</Trans>",
  "t(`hello ${name333}`)",
].join(";");

describe("extract", () => {
  it("extract correctly", async () => {
    const result = await extract(str, "test.jsx");
    expect(result.data.size).toMatchInlineSnapshot("6");
    expect(result.errMsg).toMatchInlineSnapshot(`
      "
        [36m>[0m msg id is not string literal, skip
         ,-[[36;1;4mtest.jsx[0m:1:1]
       [2m1[0m | t\`hello \${name}\`;t({ id: \\"t.fn.obj.arg\\", message: \\"Refresh inbox\\" });<Trans>hello {name2}</Trans>;<Trans id=\\"msg_id1\\">hello {name2}</Trans>;<Trans id={\\"msg_id2\\"}>hello {name2}</Trans>;<Trans id={\`msg_id3\`}>hello {name2}</Trans>;t(\`hello \${name333}\`)
         : [31;1m                                                                                                                                                                                                                                    ^^^^^^^^^^^^^^^^^^^^^[0m
         \`----
      "
    `);
    expect(result.data.filename).toMatchInlineSnapshot('undefined');

    const arr = Array.from(result.data.values()).sort((a: any, b: any) =>
      a.id.localeCompare(b.id)
    );
    expect(arr).toMatchInlineSnapshot(`
      [
        {
          "id": "hello {name}",
          "messages": "",
        },
        {
          "id": "hello {name2}",
          "messages": "",
        },
        {
          "id": "msg_id1",
          "messages": "hello {name2}",
        },
        {
          "id": "msg_id2",
          "messages": "hello {name2}",
        },
        {
          "id": "msg_id3",
          "messages": "hello {name2}",
        },
        {
          "id": "t.fn.obj.arg",
          "messages": "Refresh inbox",
        },
      ]
    `);
  });
});
