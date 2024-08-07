import { describe, it } from "vitest";
import { transPlugin } from "../src/i18n/trans";
import { matchSwcPluginOutput } from "./run";

describe("transPlugin", () => {
  it("should match swc plugin output", async () => {
    await matchSwcPluginOutput("trans/normal", transPlugin);
  });
});
