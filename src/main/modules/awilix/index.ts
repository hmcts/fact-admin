import { asClass, asValue, createContainer, InjectionMode } from 'awilix';
import { HomeController } from '../../app/controller/HomeController';
import { Application } from 'express';
import { CourtsController } from '../../app/controller/courts/CourtsController';
import { ErrorController } from '../../app/controller/ErrorController';
import { CourtDetailsController } from '../../app/controller/courts/CourtDetailsController';
import { EditCourtController } from '../../app/controller/courts/EditCourtController';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('app');

/**
 * Sets up the dependency injection container
 */
export class Container {

  public enableFor(server: Application): void {

    server.locals.container = createContainer({ injectionMode: InjectionMode.CLASSIC }).register({
      logger: asValue(logger),
      homeController: asClass(HomeController),
      courtsController: asClass(CourtsController),
      courtDetailsController: asClass(CourtDetailsController),
      editCourtController: asClass(EditCourtController),
      errorController: asClass(ErrorController),
      exposeErrors: asValue(server.locals.env === 'development')
    });
  }

}
