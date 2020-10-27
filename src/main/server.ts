
import * as bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import { Helmet } from './modules/helmet';
import * as path from 'path';
import favicon from 'serve-favicon';
import { Nunjucks } from './modules/nunjucks';
import { Passport } from './modules/passport';
import { Container } from './modules/awilix';
import { HealthCheck } from './modules/health';
import addRoutes from './routes';
import { PropertiesVolume } from './modules/properties-volume';
import { SessionStorage } from './modules/session';
import { AppInsights } from './modules/appinsights';

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
server.use(bodyParser.urlencoded({ extended: false }));
server.use(express.static(path.join(__dirname, 'public')));
server.use((req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});

setupDev(server,developmentMode);

new PropertiesVolume().enableFor(server);
new Container().enableFor(server);
new SessionStorage().enableFor(server);
new Nunjucks(developmentMode).enableFor(server);
new Helmet(config.get('security')).enableFor(server);
new Passport().enableFor(server);
new HealthCheck().enableFor(server);
new AppInsights().enableFor(server);

addRoutes(server);

export const app = server.listen(config.get('port'), () => {
  logger.info(`Application started: http://localhost:${config.get('port')}`);
});
