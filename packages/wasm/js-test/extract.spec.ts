import { describe, it, expect } from "vitest";
import { extract } from "../";

const str = ["t`hello ${name}`", "<Trans>hello {name2}</Trans>"].join(";");

describe("extract", () => {
  it("extract correctly", async () => {
    const result = await extract(str);
    expect(result).toMatchInlineSnapshot(`
      Map {
        "hello {name}" => {
          "defaults": "",
          "id": "hello {name}",
        },
        "hello {name2}" => {
          "defaults": "",
          "id": "hello {name2}",
        },
      }
    `);
  });
});
