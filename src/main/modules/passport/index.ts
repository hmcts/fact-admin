import { Application } from 'express';
import passport from 'passport';

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
    server.get('/oauth2/callback', passport.authenticate('provider', {
      successRedirect: '/courts',
      failureRedirect: '/error'
    }));

    server.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });

  }

}

export type AuthedUser = {
  id: string
}
