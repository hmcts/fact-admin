import Tokens from 'csrf';
import config from 'config';

export class CSRF {
  private static readonly token: Tokens = new Tokens();

  public static create(secret: string = config.get('csrf.tokenSecret')): string {
    return CSRF.token.create(secret);
  }

  public static verify(token: string): boolean {
    const secret: string = config.get('csrf.tokenSecret');
    return CSRF.token.verify(secret, token);
  }
}
