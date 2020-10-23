import { Application } from 'express';
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { asClass, asValue } from 'awilix';
import Axios from 'axios';
import config from 'config';
import { FactApi } from '../../app/fact/FactApi';
import { AuthedRequest } from '../../types/AuthedRequest';

/**
 * Adds the passport middleware to add oauth authentication
 */
export class Passport {

  public enableFor(server: Application): void {
    server.use(passport.initialize());
    server.use(passport.session());

    passport.serializeUser(function(user: AuthedUser, done) {
      done(null, JSON.stringify(user));
    });

    passport.deserializeUser(function(user: string, done: Function) {
      done(null, JSON.parse(user));
    });

    passport.use('provider', server.locals.container.cradle.authProviderFactory.getAuthProvider());

    server.get('/login', passport.authenticate('provider'));
    server.get(
      '/oauth2/callback',
      passport.authenticate('provider', { failureRedirect: '/error' }),
      (req: Request, res: Response) => {
        req.session.save(() => {
          res.render('redirect');
        });
      }
    );

    server.get('/logout', function(req, res){
      req.logout();
      res.render('logout');
    });

    server.use((req: AuthedRequest, res: Response, next: NextFunction) => {
      if (req.isAuthenticated()) {
        req.scope = req.app.locals.container.createScope();
        req.scope.register({
          axios: asValue(Axios.create({
            baseURL: config.get('services.api.url'),
            headers: {
              Authorization: 'Bearer ' + req.user.token
            }
          })),
          api: asClass(FactApi),
          currentUser: asValue(req.user)
        });

        return next();
      }
      res.redirect('/login');
    });

  }

}

export type AuthedUser = {
  id: string,
  token: string
}
