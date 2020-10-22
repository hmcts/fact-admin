import { Application } from 'express';
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';

/**
 * Adds the passport middleware to add oauth authentication
 */
export class Passport {

  public enableFor(server: Application): void {
    server.use(passport.initialize());
    server.use(passport.session());

    passport.serializeUser(function(user: AuthedUser, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      done(null, { id });
    });

    passport.use('provider', server.locals.container.cradle.authProviderFactory.getAuthProvider());

    // TODO
    // Register some sort of callback that creates an API client with the token pre-attached
    // // create a scoped container
    // req.scope = container.createScope()
    //
    // // register some request-specific data..
    // req.scope.register({
    //   currentUser: asValue(req.user)
    // })

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
      res.redirect('/');
    });

    server.use((req: Request, res: Response, next: NextFunction) => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/login');
    });

  }

}

export type AuthedUser = {
  id: string
}
