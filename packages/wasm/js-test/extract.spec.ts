import { describe, it, expect } from "vitest";
import { extract } from "../";

const str = [
  "t`hello ${name}`",
  "<Trans>hello {name2}</Trans>",
  '<Trans id="msg_id1">hello {name2}</Trans>',
  '<Trans id={"msg_id2"}>hello {name2}</Trans>',
].join(";");

describe("extract", () => {
  it("extract correctly", async () => {
    const result = await extract(str);
    expect(result).toMatchInlineSnapshot(`
      Map {
        "msg_id2" => {
          "id": "msg_id2",
          "messages": "hello {name2}",
        },
        "msg_id1" => {
          "id": "msg_id1",
          "messages": "hello {name2}",
        },
        "hello {name}" => {
          "id": "hello {name}",
          "messages": "",
        },
        "hello {name2}" => {
          "id": "hello {name2}",
          "messages": "",
        },
      }
    `);
  });
});
