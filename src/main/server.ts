import * as bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import {Helmet} from './modules/helmet';
import * as path from 'path';
import favicon from 'serve-favicon';
import {Nunjucks} from './modules/nunjucks';
import {Container} from './modules/awilix';
import {HealthCheck} from './modules/health';
import addRoutes from './routes';
import {PropertiesVolume} from './modules/properties-volume';
import {SessionStorage} from './modules/session';
import {AppInsights} from './modules/appinsights';
import {OidcMiddleware} from './modules/oidc';
import FeatureToggleService from './modules/featureToggle';
import LaunchDarkly from './utils/LaunchDarkly';

const { Express, Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('server');
const { setupDev } = require('./development');
const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';
const server = express();

server.locals.ENV = env;
server.use(Express.accessLogger());
server.use(favicon(path.join(__dirname, '/public/assets/images/favicon.ico')));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public')));
server.use('/tinymce', express.static(path.join(__dirname, '..', '..', 'node_modules', 'tinymce')));

server.use((req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});

setupDev(server,developmentMode);

console.log('process env node: ' + process.env.NODE_ENV);

new PropertiesVolume().enableFor(server);
new Container().enableFor(server);
new SessionStorage(developmentMode).enableFor(server);
new FeatureToggleService(LaunchDarkly.getInstance());
new Nunjucks(developmentMode).enableFor(server);
new Helmet(config.get('security')).enableFor(server);
new HealthCheck().enableFor(server);
new AppInsights().enableFor(server);
new OidcMiddleware().enableFor(server);
addRoutes(server);

export const app = server.listen(config.get('port'), () => {
  logger.info(`Application started: http://localhost:${config.get('port')}`);
});
