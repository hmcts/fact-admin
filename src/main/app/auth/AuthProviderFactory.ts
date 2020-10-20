import autobind from 'autobind-decorator';
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

@autobind
export class AuthProviderFactory {

  constructor(
    private readonly config: IdamConfig
  ) { }

  public getAuthProvider(): typeof OAuth2Strategy {
    return new OAuth2Strategy(
      this.config,
      this.responseHandler
    );
  }

  private responseHandler(accessToken: string, refreshToken: string, profile: unknown, done: Function): void {
    try {
      // TODO proper JWT decoding
      const jwt = accessToken.split('.')[1];
      const jsonString = Buffer.from(jwt, 'base64').toString();
      const json = JSON.parse(jsonString);

      done(null, { id: json.sub });
    } catch (err) {
      done(err);
    }
  }
}

export interface IdamConfig {
  authorizationURL: string,
  tokenURL: string,
  clientID: string,
  clientSecret: string,
  callbackURL: string
}
