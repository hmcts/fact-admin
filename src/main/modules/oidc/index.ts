import {Application, NextFunction, Request, Response} from 'express';
import {asClass, asValue} from 'awilix';
import Axios from 'axios';
import config from 'config';
import {FactApi} from '../../app/fact/FactApi';
import {AuthedRequest} from '../../types/AuthedRequest';
// eslint-disable-next-line @typescript-eslint/camelcase
import jwt_decode from 'jwt-decode';

/**
 * Adds the oidc middleware to add oauth authentication
 */
export class OidcMiddleware {

  public enableFor(server: Application): void {
    const loginUrl: string = config.get('services.idam.authorizationURL');
    const tokenUrl: string = config.get('services.idam.tokenURL');
    const clientId: string = config.get('services.idam.clientID');
    const clientSecret: string = config.get('services.idam.clientSecret');
    const redirectUri: string = config.get('services.idam.callbackURL');

    server.get('/login', (req, res) => {
      res.redirect(loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri));
    });

    server.get('/oauth2/callback', async (req: Request, res: Response) => {
      const response = await Axios.post(
        tokenUrl,
        `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(req.query.code as string)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      req.session.user = response.data;
      req.session.user.jwt = jwt_decode(response.data.id_token);
      req.session.user.isSuperAdmin = req.session.user.jwt.roles.includes('fact-super-admin');
      res.render('redirect');
    });

    server.get('/logout', function(req, res){
      req.session.user = undefined;
      res.render('logout');
    });

    server.use((req: AuthedRequest, res: Response, next: NextFunction) => {
      if (req.session.user) {
        req.scope = req.app.locals.container.createScope();
        req.scope.register({
          axios: asValue(Axios.create({
            baseURL: config.get('services.api.url'),
            headers: {
              Authorization: 'Bearer ' + req.session.user.id_token
            }
          })),
          api: asClass(FactApi)
        });

        res.locals.isLoggedIn = true;
        res.locals.isSuperAdmin = req.session.user.jwt.roles.includes('fact-super-admin');

        return next();
      }
      res.redirect('/login');
    });

  }

}

export const isSuperAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (res.locals.isSuperAdmin) {
    next();
  } else {
    res.redirect('/courts');
  }
};

export type AuthedUser = {
  id_token: string
}
