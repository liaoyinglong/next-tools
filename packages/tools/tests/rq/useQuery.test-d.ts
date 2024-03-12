import { describe, it } from "vitest";
import { authOauthTokenPostApi } from "./api";

describe("rq.userQueryType", () => {
  const req = {
    client_id: "string",
    scope: "string",
    grant_type: "string",
    username: "string",
    password: "string",
    login_mode: "string",
    attach: "string",
  };

  it("options queryKey is partial", () => {
    authOauthTokenPostApi.useQuery(req, {
      enabled: true,
    });
  });

  it("can pass meta", () => {
    authOauthTokenPostApi.useQuery(req, {
      enabled: true,
      meta: "string",
    });
  });
});
