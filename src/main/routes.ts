import { Application } from 'express';
import { isSuperAdmin } from './modules/oidc';

export default function(app: Application): void {

  app.get('/', (req, res) => res.redirect('/courts'));
  app.get('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.get);
  app.post('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.post);
  app.get('/courts', app.locals.container.cradle.courtsController.get);
  app.get('/courts/download', app.locals.container.cradle.courtsDownloadController.get);

  // Edit court
  app.get('/courts/:slug/edit', app.locals.container.cradle.editCourtController.get);
  app.get('/courts/:slug/general-info', app.locals.container.cradle.generalInfoController.get);
  app.put('/courts/:slug/general-info', app.locals.container.cradle.generalInfoController.put);
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
  app.get('/courts/:slug/additionalLinks', app.locals.container.cradle.additionalLinksController.get);
  app.put('/courts/:slug/additionalLinks', app.locals.container.cradle.additionalLinksController.put);

  // Lists
  app.get('/lists', isSuperAdmin, app.locals.container.cradle.listsController.get);
  app.get('/courts/:slug/facilities', app.locals.container.cradle.courtFacilitiesController.get);
  app.put('/courts/:slug/facilities', app.locals.container.cradle.courtFacilitiesController.put);
  app.put('/courts/facilities/add-row', app.locals.container.cradle.courtFacilitiesController.addRow);
  app.get('/lists/local-authorities-list', isSuperAdmin, app.locals.container.cradle.localAuthoritiesListController.get);
  app.put('/lists/local-authorities-list', isSuperAdmin, app.locals.container.cradle.localAuthoritiesListController.put);
  app.get('/lists/areas-of-law', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getAll);
  app.get('/lists/area-of-law/:id', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getAreaOfLaw);
  app.get('/lists/area-of-law', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getAreaOfLaw);
  app.get('/lists/area-of-law/delete-confirm/:id', isSuperAdmin, app.locals.container.cradle.areasOfLawController.getDeleteConfirmation);
  app.put('/lists/area-of-law', isSuperAdmin, app.locals.container.cradle.areasOfLawController.put);
  app.delete('/lists/area-of-law/:id', isSuperAdmin, app.locals.container.cradle.areasOfLawController.delete);

  // General
  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);
}
