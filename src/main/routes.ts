import {Application} from 'express';
import {isSuperAdmin} from './modules/oidc';
import {FeatureFlags} from './app/feature-flags/FeatureFlags';
import {
  FACT_ADMIN_TAB_GENERAL
} from './app/feature-flags/flags';
import {AuthedRequest} from './types/AuthedRequest';
const multer = require('multer');

export default function(app: Application): void {
  const featureFlags: FeatureFlags = app.locals.container.cradle.featureFlags;

  const upload = multer();

  /**
   * Remove a court lock if any of the routes are being loaded that would indicate lock is no longer required.
   */
  app.use(async (req, res, next) => {
    const authedReq = req as AuthedRequest;

    // Routes that when called the lock should be removed
    const dynamicLockRemovalRoutes = [
      '/bulk-update',
      '/courts/add-court',
      '/users',
      '/lists',
      '/lists/local-authorities-list',
      '/lists/areas-of-law',
      '/lists/area-of-law',
      '/lists/contact-types',
      '/lists/facility-types',
      '/lists/opening-types',
      '/audits',
      '/audit-data',
      '/audit-data-download'
    ];

    // Exact match routes so anything after the route doesn't get removed e.g. only /court not /court/test-court/edit
    const exactMatchLockRemovalRoutes = [
      '/courts'
    ];

    // Check if path is part of list of paths (dynamic or exact match), if it is then remove the lock
    if (exactMatchLockRemovalRoutes.includes(authedReq.path) ||
      dynamicLockRemovalRoutes.some((route) => authedReq.path.startsWith(route))) {
      await authedReq.scope.cradle.api.deleteCourtLocksByEmail(authedReq.appSession['user']['jwt']['sub']);
    }

    next();
  });

  app.get('/',(req, res) => res.redirect('/courts'));
  app.get('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.get);
  app.post('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.post);
  app.get('/courts', app.locals.container.cradle.courtsController.get);
  app.get('/courts/add-court', isSuperAdmin, app.locals.container.cradle.newCourtController.get);
  app.post('/courts/add-court', isSuperAdmin, app.locals.container.cradle.newCourtController.addNewCourt);
  app.get('/courts/download', app.locals.container.cradle.courtsDownloadController.get);

  //Users
  app.get('/users',isSuperAdmin,app.locals.container.cradle.accountController.get);

  // Edit court
  app.get('/courts/:slug/spoe', isSuperAdmin, app.locals.container.cradle.courtSpoeController.get);
  app.put('/courts/:slug/spoe', isSuperAdmin, app.locals.container.cradle.courtSpoeController.put);
  app.get('/courts/:slug/edit', app.locals.container.cradle.editCourtController.get);
  app.get('/courts/:slug/general-info', featureFlags.toggleRoute(FACT_ADMIN_TAB_GENERAL), app.locals.container.cradle.generalInfoController.get);
  app.get('/courts/:slug/general-info', featureFlags.toggleRoute(FACT_ADMIN_TAB_GENERAL), app.locals.container.cradle.generalInfoController.renderRedirect);
  app.put('/courts/:slug/general-info', featureFlags.toggleRoute(FACT_ADMIN_TAB_GENERAL), app.locals.container.cradle.generalInfoController.put);
  app.get('/courts/:slug/opening-times', app.locals.container.cradle.openingTimesController.get);
  app.put('/courts/:slug/opening-times', app.locals.container.cradle.openingTimesController.put);
  app.get('/courts/:slug/emails', app.locals.container.cradle.emailsController.get);
  app.put('/courts/:slug/emails', app.locals.container.cradle.emailsController.put);
  app.get('/courts/:slug/contacts', app.locals.container.cradle.contactsController.get);
  app.put('/courts/:slug/contacts', app.locals.container.cradle.contactsController.put);
  app.get('/courts/:slug/court-types', app.locals.container.cradle.courtTypesController.get);
  app.put('/courts/:slug/court-types', app.locals.container.cradle.courtTypesController.put);
  app.get('/courts/:slug/postcodes', app.locals.container.cradle.postcodesController.get);
  app.post('/courts/:slug/postcodes', app.locals.container.cradle.postcodesController.post);
  app.delete('/courts/:slug/postcodes', app.locals.container.cradle.postcodesController.delete);
  app.put('/courts/:slug/postcodes', app.locals.container.cradle.postcodesController.put);
  app.get('/courts/:slug/local-authorities-areas-of-law', app.locals.container.cradle.localAuthoritiesController.getAreasOfLaw);
  app.get('/courts/:slug/:areaOfLaw/local-authorities', app.locals.container.cradle.localAuthoritiesController.getLocalAuthorities);
  app.put('/courts/:slug/:areaOfLaw/local-authorities', isSuperAdmin, app.locals.container.cradle.localAuthoritiesController.put);
  app.get('/courts/:slug/addresses', app.locals.container.cradle.addressController.get);
  app.put('/courts/:slug/addresses', app.locals.container.cradle.addressController.put);
  app.get('/courts/:slug/cases-heard', app.locals.container.cradle.casesHeardController.get);
  app.put('/courts/:slug/cases-heard', app.locals.container.cradle.casesHeardController.put);
  app.get('/courts/:slug/photo', app.locals.container.cradle.photoController.get);
  app.get('/courts/:slug/photo/:imageToDelete/confirm-delete', app.locals.container.cradle.photoController.getDeleteConfirmation);
  app.put('/courts/:slug/photo', upload.single('photo'), app.locals.container.cradle.photoController.put);
  app.delete('/courts/:slug/photo', app.locals.container.cradle.photoController.delete);
  app.get('/courts/:slug/additionalLinks', isSuperAdmin, app.locals.container.cradle.additionalLinksController.get);
  app.put('/courts/:slug/additionalLinks', isSuperAdmin, app.locals.container.cradle.additionalLinksController.put);
  app.get('/courts/:slug/application-progression', app.locals.container.cradle.applicationProgressionController.get);
  app.put('/courts/:slug/application-progression', app.locals.container.cradle.applicationProgressionController.put);
  app.get('/courts/:slug/facilities', app.locals.container.cradle.courtFacilitiesController.get);
  app.put('/courts/:slug/facilities', app.locals.container.cradle.courtFacilitiesController.put);
  app.put('/courts/facilities/add-row', app.locals.container.cradle.courtFacilitiesController.addRow);

  // Lists
  app.get('/lists', isSuperAdmin, app.locals.container.cradle.listsController.get);
  app.get('/lists/local-authorities-list', isSuperAdmin, app.locals.container.cradle.localAuthoritiesListController.get);
  app.put('/lists/local-authorities-list', isSuperAdmin, app.locals.container.cradle.localAuthoritiesListController.put);
  app.get('/lists/areas-of-law', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getAll);
  app.get('/lists/area-of-law/:id', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getAreaOfLaw);
  app.get('/lists/area-of-law', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getAreaOfLaw);
  app.get('/lists/area-of-law/delete-confirm/:id', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getDeleteConfirmation);
  app.put('/lists/area-of-law', isSuperAdmin, app.locals.container.cradle.areasOfLawController.put);
  app.delete('/lists/area-of-law/:id', isSuperAdmin, app.locals.container.cradle.areasOfLawController.delete);
  app.get('/lists/contact-types', isSuperAdmin, app.locals.container.cradle.contactTypesController.getAll);
  app.get('/lists/contact-type/:id', isSuperAdmin, app.locals.container.cradle.contactTypesController.getContactType);
  app.get('/lists/contact-type', isSuperAdmin, app.locals.container.cradle.contactTypesController.getContactType);
  app.get('/lists/contact-type/delete-confirm/:id', isSuperAdmin, app.locals.container.cradle.contactTypesController.getDeleteConfirmation);
  app.put('/lists/contact-type', isSuperAdmin, app.locals.container.cradle.contactTypesController.put);
  app.delete('/lists/contact-type/:id', isSuperAdmin, app.locals.container.cradle.contactTypesController.delete);
  app.get('/lists/facility-types', isSuperAdmin, app.locals.container.cradle.facilityTypesController.getAll);
  app.get('/lists/facility-type/:id', isSuperAdmin, app.locals.container.cradle.facilityTypesController.getFacilityType);
  app.get('/lists/facility-type', isSuperAdmin, app.locals.container.cradle.facilityTypesController.getFacilityType);
  app.get('/lists/facility-types/delete-confirm/:id', isSuperAdmin, app.locals.container.cradle.facilityTypesController.getDeleteConfirmation);
  app.put('/lists/facility-types', isSuperAdmin, app.locals.container.cradle.facilityTypesController.put);
  app.delete('/lists/facility-types/:id', isSuperAdmin, app.locals.container.cradle.facilityTypesController.delete);
  app.get('/lists/facility-types/reorder', isSuperAdmin, app.locals.container.cradle.facilityTypesController.getAllReorder);
  app.put('/lists/facility-types/reorder', isSuperAdmin, app.locals.container.cradle.facilityTypesController.reorder);

  app.get('/lists/opening-types', isSuperAdmin, app.locals.container.cradle.openingTypesController.getAll);
  app.get('/lists/opening-type/:id', isSuperAdmin, app.locals.container.cradle.openingTypesController.getOpeningType);
  app.get('/lists/opening-type', isSuperAdmin, app.locals.container.cradle.openingTypesController.getOpeningType);
  app.get('/lists/opening-types/delete-confirm/:id', isSuperAdmin, app.locals.container.cradle.openingTypesController.getDeleteConfirmation);
  app.put('/lists/opening-type', isSuperAdmin, app.locals.container.cradle.openingTypesController.put);
  app.delete('/lists/opening-type/:id', isSuperAdmin, app.locals.container.cradle.openingTypesController.delete);

  // Audits
  app.get('/audits', isSuperAdmin, app.locals.container.cradle.auditController.get);
  app.get('/audit-data', isSuperAdmin, app.locals.container.cradle.auditController.getAuditData);
  app.get('/audit-data-download', isSuperAdmin, app.locals.container.cradle.auditController.downloadAuditData);

  // logout
  app.get('/logout', app.locals.container.cradle.logoutController.get);

  // General
  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);
}
