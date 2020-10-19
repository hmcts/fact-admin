import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import Axios from 'axios';
import config from 'config';
import { FactApi } from '../../app/fact/FactApi';
import { HomeController } from '../../app/controller/HomeController';
import { AuthProviderFactory } from '../../app/auth/AuthProviderFactory';
import { Application } from 'express';
import { CourtsController } from '../../app/controller/CourtsController';
import { ErrorController } from '../../app/controller/ErrorController';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('app');

/**
 * Sets up the dependency injection container
 */
export class Container {

  public enableFor(server: Application): void {

    server.locals.container = createContainer({ injectionMode: InjectionMode.CLASSIC }).register({
      logger: asValue(logger),
      axios: asValue(Axios.create({ baseURL: config.get('services.api.url') })),
      api: asClass(FactApi),
      homeController: asClass(HomeController),
      courtsController: asClass(CourtsController),
      errorController: asClass(ErrorController),
      exposeErrors: asValue(server.locals.env === 'development'),
      authProviderFactory: asValue(new AuthProviderFactory(config.get('services.idam')))
    });
  }

}
