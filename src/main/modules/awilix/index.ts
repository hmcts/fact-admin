import {asClass, asValue, createContainer, InjectionMode} from 'awilix';
import {Application} from 'express';
import {CourtsController} from '../../app/controller/courts/CourtsController';
import {CourtsDownloadController} from '../../app/controller/courts/CourtsDownloadController';
import {ErrorController} from '../../app/controller/ErrorController';
import {EditCourtController} from '../../app/controller/courts/EditCourtController';
import {BulkUpdateController} from '../../app/controller/bulk-update/BulkUpdateController';
import {OpeningTimesController} from '../../app/controller/courts/OpeningTimesController';
import {GeneralInfoController} from '../../app/controller/courts/GeneralInfoController';
import {EmailsController} from '../../app/controller/courts/EmailsController';
import {CourtHistoryController} from '../../app/controller/courts/CourtHistoryController';
import {ContactsController} from '../../app/controller/courts/ContactsController';
import {CourtTypesController} from '../../app/controller/courts/CourtTypesController';
import {ListsController} from '../../app/controller/lists/ListsController';
import {LocalAuthoritiesController} from '../../app/controller/courts/LocalAuthoritiesController';
import {LocalAuthoritiesListController} from '../../app/controller/lists/LocalAuthoritiesListController';
import {CourtFacilitiesController} from '../../app/controller/courts/CourtFacilitiesController';
import {PostcodesController} from '../../app/controller/courts/PostcodesController';
import {CasesHeardController} from '../../app/controller/courts/CasesHeardController';
import {AddressController} from '../../app/controller/courts/AddressController';
import {AreasOfLawController} from '../../app/controller/lists/AreasOfLawController';
import {PhotoController} from '../../app/controller/courts/PhotoController';
import {AuditController} from '../../app/controller/audits/AuditController';
import {ContactTypesController} from '../../app/controller/lists/ContactTypesController';
import {FacilityTypesController} from '../../app/controller/lists/FacilityTypesController';
import {CourtSpoeController} from '../../app/controller/courts/CourtSpoeController';
import {OpeningTypesController} from '../../app/controller/lists/OpeningTypesController';
import {AdditionalLinksController} from '../../app/controller/courts/AdditionalLinksController';
import {UserController} from '../../app/controller/users/UserController';
import {NewCourtController} from '../../app/controller/courts/NewCourtController';
import {ApplicationProgressionController} from '../../app/controller/courts/ApplicationProgressionController';
import {FeatureFlags} from '../../app/feature-flags/FeatureFlags';
import {LaunchDarkly} from '../../app/feature-flags/LaunchDarklyClient';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('app');

/**
 * Sets up the dependency injection container
 */
export class Container {

  public enableFor(server: Application): void {

    server.locals.container = createContainer({ injectionMode: InjectionMode.CLASSIC }).register({
      logger: asValue(logger),
      featureFlags: asValue(new FeatureFlags(new LaunchDarkly())),
      bulkUpdateController: asClass(BulkUpdateController),
      courtsController: asClass(CourtsController),
      newCourtController: asClass(NewCourtController),
      courtsDownloadController: asClass(CourtsDownloadController),

      // Edit Court
      editCourtController: asClass(EditCourtController),
      openingTimesController: asClass(OpeningTimesController),
      emailsController: asClass(EmailsController),
      courtHistoryController: asClass(CourtHistoryController),
      postcodesController: asClass(PostcodesController),
      generalInfoController: asClass(GeneralInfoController),
      contactsController: asClass(ContactsController),
      courtTypesController: asClass(CourtTypesController),
      courtSpoeController: asClass(CourtSpoeController),
      localAuthoritiesController: asClass(LocalAuthoritiesController),
      addressController: asClass(AddressController),
      photoController: asClass(PhotoController),
      additionalLinksController: asClass(AdditionalLinksController),
      applicationProgressionController: asClass(ApplicationProgressionController),

      // List
      listsController: asClass(ListsController),
      localAuthoritiesListController : asClass(LocalAuthoritiesListController),
      courtFacilitiesController : asClass(CourtFacilitiesController),
      casesHeardController: asClass(CasesHeardController),
      areasOfLawController: asClass(AreasOfLawController),
      contactTypesController : asClass(ContactTypesController),
      facilityTypesController: asClass(FacilityTypesController),
      openingTypesController: asClass(OpeningTypesController),
      errorController: asClass(ErrorController),

      // Audits
      auditController: asClass(AuditController),

      exposeErrors: asValue(server.locals.env === 'development'),

      //User
      accountController : asClass(UserController)
    });
  }
}
