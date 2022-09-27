import fs from "fs-extra";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { homeConfigDir, createLogger } from "../index";
import { openAndWaitReturnQuery } from "./shared";

interface AuthOptions {
  client_id: string;
  client_secret: string;
  /**
   * @default ['spreadsheets']
   */
  scope?: string[];
}

const log = createLogger("google:auth");

class GoogleAuth {
  private tokens: any = null;

  private tokensCachePath = homeConfigDir("chromeAuthToken.json");

  private readonly scope: string[];

  oauth2Client: OAuth2Client = new google.auth.OAuth2(
    this.options.client_id,
    this.options.client_secret,
    "http://localhost:12345"
  );

  constructor(private options: AuthOptions) {
    this.options.scope = this.options.scope ?? ["spreadsheets"];
    const scopePrefix = `https://www.googleapis.com/auth/`;
    this.scope = this.options.scope.map((item) => {
      if (item.startsWith(scopePrefix)) {
        return item;
      }
      return `${scopePrefix}${item}`;
    });

    try {
      this.tokens = fs.readJsonSync(this.tokensCachePath);
    } catch (e) {
      log.info("未获取到缓存的token");
      this.tokens = null;
    }
  }

  private async saveTokens(tokens: any): Promise<void> {
    this.tokens = tokens;
    await fs.writeJSON(this.tokensCachePath, tokens);
    log.info("保存token成功");
  }

  async getCode(): Promise<string> {
    log.info("将打开chrome浏览器进行授权");
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.scope,
    });
    return await openAndWaitReturnQuery(authUrl, 12345, "code");
  }

  private async initCredentialsImpl(): Promise<void> {
    if (!this.tokens) {
      const code = await this.getCode();
      const { tokens } = await this.oauth2Client.getToken(code);
      await this.saveTokens(tokens);
    }
    this.oauth2Client.setCredentials(this.tokens);
  }
  private initCredentialsPromise: Promise<void> | null = null;
  async initCredentials() {
    if (!this.initCredentialsPromise) {
      this.initCredentialsPromise = this.initCredentialsImpl();
    }
    return await this.initCredentialsPromise;
  }
}

// see in https://console.cloud.google.com/apis/credentials?organizationId=286245507762&orgonly=true&project=dune-cli&supportedpurview=organizationId
const clientSecret = {
  client_id:
    "728508473485-fgl11a3op1ucd0lef9hs49mkliuaipqa.apps.googleusercontent.com",
  project_id: "dune-cli",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_secret: "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",
  redirect_uris: ["http://localhost"],
};
export const googleAuth = new GoogleAuth(clientSecret);
