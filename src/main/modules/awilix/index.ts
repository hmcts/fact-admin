import {asClass, asValue, createContainer, InjectionMode} from 'awilix';
import {Application} from 'express';
import {CourtsController} from '../../app/controller/courts/CourtsController';
import {CourtsDownloadController} from '../../app/controller/courts/CourtsDownloadController';
import {ErrorController} from '../../app/controller/ErrorController';
import {CourtDetailsController} from '../../app/controller/courts/CourtDetailsController';
import {EditCourtController} from '../../app/controller/courts/EditCourtController';
import {BulkUpdateController} from '../../app/controller/bulk-update/BulkUpdateController';
import {OpeningTimesController} from '../../app/controller/courts/OpeningTimesController';
import {GeneralInfoController} from '../../app/controller/courts/GeneralInfoController';
import {EmailsController} from '../../app/controller/courts/EmailsController';
import {ContactsController} from '../../app/controller/courts/ContactsController';
import {CourtTypesController} from '../../app/controller/courts/CourtTypesController';
import {LocalAuthoritiesController} from '../../app/controller/courts/LocalAuthoritiesController';
import {PostcodesController} from '../../app/controller/courts/PostcodesController';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('app');

/**
 * Sets up the dependency injection container
 */
export class Container {

  public enableFor(server: Application): void {

    server.locals.container = createContainer({ injectionMode: InjectionMode.CLASSIC }).register({
      logger: asValue(logger),
      bulkUpdateController: asClass(BulkUpdateController),
      courtsController: asClass(CourtsController),
      courtsDownloadController: asClass(CourtsDownloadController),
      courtDetailsController: asClass(CourtDetailsController),
      editCourtController: asClass(EditCourtController),
      openingTimesController: asClass(OpeningTimesController),
      emailsController: asClass(EmailsController),
      postcodesController: asClass(PostcodesController),
      generalInfoController: asClass(GeneralInfoController),
      contactsController: asClass(ContactsController),
      courtTypesController: asClass(CourtTypesController),
      localAuthoritiesController: asClass(LocalAuthoritiesController),
      errorController: asClass(ErrorController),
      exposeErrors: asValue(server.locals.env === 'development')
    });
  }
}
