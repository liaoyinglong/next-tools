import { describe } from "vitest";
import { zustandPlugin } from "../../src/zustand";
import { fixtures } from "../run";

describe.skip("zustand", async () => {
  await fixtures(__dirname, zustandPlugin);
});
