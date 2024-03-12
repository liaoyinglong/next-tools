import { RequestBuilder } from "../../rq/RequestBuilder";

export const authOauthTokenPostApi = new RequestBuilder<
  authOauthTokenPostApi.Req,
  authOauthTokenPostApi.Res
>({
  method: "post",
  url: "/v1/auth/oauth/token",
});

export namespace authOauthTokenPostApi {
  export interface Req {
    client_id: string;
    scope: string;
    grant_type: string;
    username: string; // wallet address
    password: string; // signature
    login_mode: string;
    attach: string; // JSON string with chainId, nonce, and timestamp
  }

  export interface Res {
    access_token: string;
    refresh_token: string;
    accountId: string;
    userId: string;
  }
}
