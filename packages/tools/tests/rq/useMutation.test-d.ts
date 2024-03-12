import { describe, it } from "vitest";
import { authOauthTokenPostApi } from "./api";

describe("rq.useMutationType", () => {
  it("options is partial", () => {
    authOauthTokenPostApi.useMutation({});
  });
});
