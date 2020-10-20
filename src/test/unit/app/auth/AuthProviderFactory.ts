import { AuthProviderFactory } from '../../../../main/app/auth/AuthProviderFactory';

const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

describe('AuthProviderFactory', () => {
  const factory = new AuthProviderFactory({
    authorizationURL: 'http://localhost',
    callbackURL: 'http://localhost',
    clientID: 'test',
    clientSecret: 'test',
    tokenURL: 'http://localhost'
  });

  test('creates a provider', async () => {
    const result = factory.getAuthProvider();
    expect(result.constructor).toEqual(OAuth2Strategy);
  });

  test('throws an error with an invalid JWT', async () => {
    const result = factory.getAuthProvider();

    await new Promise((resolve, reject) => {
      result._verify('access', 'refresh', 'profile', (err: string) => {
        try {
          expect(err).not.toBeNull();
          resolve();
        }
        catch (e) {
          reject();
        }
      });
    });
  });

  test('decodes a JWT', async () => {
    const result = factory.getAuthProvider();
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
      'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    await new Promise((resolve, reject) => {
      result._verify(jwt, 'id', 'profile', (err: string) => {
        try {
          expect(err).toBeNull();
          resolve();
        }
        catch (e) {
          reject();
        }
      });
    });
  });

});
