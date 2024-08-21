import { describe, it } from "vitest";
import { tFunctionPlugin } from "../../src/i18n/tFunction";
import { matchSwcPluginOutput } from "./run";

describe("tFunctionPlugin", () => {
  it("should match swc plugin output", async () => {
    await matchSwcPluginOutput("t_function/issues", tFunctionPlugin);
    await matchSwcPluginOutput("t_function/normal", tFunctionPlugin);
  });
});
