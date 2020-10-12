import { glob } from 'glob';

const { Express, Logger } = require('@hmcts/nodejs-logging');

import * as bodyParser from 'body-parser';
import config = require('config');
import cookieParser from 'cookie-parser';
import express from 'express';
import { Helmet } from './modules/helmet';
import * as path from 'path';
import favicon from 'serve-favicon';
import { HTTPError } from 'HttpError';
import { Nunjucks } from './modules/nunjucks';
import passport = require('passport');

const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const { setupDev } = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

export const app = express();
app.locals.ENV = env;

// setup logging of HTTP requests
app.use(Express.accessLogger());

const logger = Logger.getLogger('app');

new Nunjucks(developmentMode).enableFor(app);
// secure the application by adding various HTTP headers to its responses
new Helmet(config.get('security')).enableFor(app);

app.use(favicon(path.join(__dirname, '/public/assets/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});

app.use(require('express-session')({
  secret: 'express-session',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user: any, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, { id });
});

passport.use('provider', new OAuth2Strategy(
  {
    authorizationURL: 'http://localhost:3501/login',
    tokenURL: 'http://localhost:5000/o/token',
    clientID: 'ccd_gateway',
    clientSecret: 'ccd_gateway_secret',
    callbackURL: 'http://localhost:3300/oauth2/callback'
  },
  function(accessToken: string, refreshToken: string, profile: any, done: Function) {
    console.log('profile', profile);
    done(null, { id: 'Bob' });
  }
));

app.get('/login', passport.authenticate('provider'));
app.get('/oauth2/callback', passport.authenticate('provider', { successRedirect: '/secured-page', failureRedirect: '/?failure' }));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

glob.sync(__dirname + '/routes/**/*.+(ts|js)')
  .map(filename => require(filename))
  .forEach(route => route.default(app));

setupDev(app,developmentMode);
// returning "not found" page for requests with paths not resolved by the router
app.use((req, res) => {
  res.status(404);
  res.render('not-found');
});

// error handler
app.use((err: HTTPError, req: express.Request, res: express.Response) => {
  logger.error(`${err.stack || err}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
