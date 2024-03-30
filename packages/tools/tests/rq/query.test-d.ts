import { describe, it } from "vitest";
import { authOauthTokenPostApi } from "./api";

describe("rq.query", () => {
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
    authOauthTokenPostApi.ensureQueryData(req, {
      staleTime: Infinity,
    });
    authOauthTokenPostApi.fetchQuery(req, {
      staleTime: Infinity,
    });
    authOauthTokenPostApi.prefetchQuery(req, {
      staleTime: Infinity,
    });
  });

  it("can pass meta", () => {
    authOauthTokenPostApi.useQuery(req, {
      enabled: true,
      meta: "string",
    });

    authOauthTokenPostApi.ensureQueryData(req, {
      staleTime: Infinity,
      meta: "string",
    });
    authOauthTokenPostApi.fetchQuery(req, {
      staleTime: Infinity,
      meta: "string",
    });
    authOauthTokenPostApi.prefetchQuery(req, {
      staleTime: Infinity,
      meta: "string",
    });
  });
});
