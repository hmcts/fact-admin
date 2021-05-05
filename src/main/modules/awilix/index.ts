import {asClass, asValue, createContainer, InjectionMode} from 'awilix';
import {HomeController} from '../../app/controller/HomeController';
import {Application} from 'express';
import {CourtsController} from '../../app/controller/courts/CourtsController';
import {CourtsDownloadController} from '../../app/controller/courts/CourtsDownloadController';
import {ErrorController} from '../../app/controller/ErrorController';
import {CourtDetailsController} from '../../app/controller/courts/CourtDetailsController';
import {EditCourtGeneralController} from '../../app/controller/courts/EditCourtGeneralController';
import {BulkUpdateController} from '../../app/controller/bulk-update/BulkUpdateController';
import {OpeningTimesController} from '../../app/controller/courts/OpeningTimesController';
import {EmailsController} from '../../app/controller/courts/EmailsController';

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
      bulkUpdateController: asClass(BulkUpdateController),
      courtsController: asClass(CourtsController),
      courtsDownloadController: asClass(CourtsDownloadController),
      courtDetailsController: asClass(CourtDetailsController),
      editCourtGeneralController: asClass(EditCourtGeneralController),
      openingTimesController: asClass(OpeningTimesController),
      emailsController: asClass(EmailsController),
      errorController: asClass(ErrorController),
      exposeErrors: asValue(server.locals.env === 'development')
    });
  }
}
