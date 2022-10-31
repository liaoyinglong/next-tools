import { describe, it, expect } from "vitest";
import { extract } from "..";

const str = [
  "t`hello ${name}`",
  "<Trans>hello {name2}</Trans>",
  '<Trans id="msg_id1">hello {name2}</Trans>',
  '<Trans id={"msg_id2"}>hello {name2}</Trans>',
  "<Trans id={`msg_id3`}>hello {name2}</Trans>",
  "t(`hello ${name333}`)",
].join(";");

describe("extract", () => {
  it("extract correctly", async () => {
    const result = await extract(str, "test.jsx");
    expect(result.data.size).toMatchInlineSnapshot("5");
    expect(result.errMsg).toMatchInlineSnapshot(`
      "
        [36m>[0m msg id is not string literal, skip
         ,-[[36;1;4mtest.jsx[0m:1:1]
       [2m1[0m | t\`hello \${name}\`;<Trans>hello {name2}</Trans>;<Trans id=\\"msg_id1\\">hello {name2}</Trans>;<Trans id={\\"msg_id2\\"}>hello {name2}</Trans>;<Trans id={\`msg_id3\`}>hello {name2}</Trans>;t(\`hello \${name333}\`)
         : [31;1m                                                                                                                                                                                ^^^^^^^^^^^^^^^^^^^^^[0m
         \`----
      "
    `);
    expect(result.data).toMatchInlineSnapshot(`
      Map {
        "hello {name2}" => {
          "id": "hello {name2}",
          "messages": "",
        },
        "hello {name}" => {
          "id": "hello {name}",
          "messages": "",
        },
        "msg_id3" => {
          "id": "msg_id3",
          "messages": "hello {name2}",
        },
        "msg_id1" => {
          "id": "msg_id1",
          "messages": "hello {name2}",
        },
        "msg_id2" => {
          "id": "msg_id2",
          "messages": "hello {name2}",
        },
      }
    `);
  });
});
