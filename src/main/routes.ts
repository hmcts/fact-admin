import {Application} from 'express';
import {isSuperAdmin} from './modules/oidc';

const multer = require('multer');

export default function(app: Application): void {

  const upload = multer();


  app.get('/', (req, res) => res.redirect('/courts'));
  app.get('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.get);
  app.post('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.post);
  app.get('/courts', app.locals.container.cradle.courtsController.get);
  app.get('/courts/add-court', isSuperAdmin, app.locals.container.cradle.newCourtController.get);
  app.post('/courts/add-court', isSuperAdmin, app.locals.container.cradle.newCourtController.addNewCourt);
  app.get('/courts/download', app.locals.container.cradle.courtsDownloadController.get);

  //Users
  app.get('/users',isSuperAdmin,app.locals.container.cradle.accountController.get);
  app.get('/users/invite/user',isSuperAdmin, app.locals.container.cradle.inviteUserController.renderUserInvite);
  app.post('/users/invite/user',isSuperAdmin, app.locals.container.cradle.inviteUserController.postUserInvite);
  app.get('/users/password',isSuperAdmin, app.locals.container.cradle.inviteUserController.renderPassword);
  app.post('/users/password',isSuperAdmin, app.locals.container.cradle.inviteUserController.postPassword);
  app.get('user/invite/successful',isSuperAdmin, app.locals.container.cradle.inviteUserController.renderInviteSuccessful);

  // Edit court
  app.get('/courts/:slug/spoe',isSuperAdmin, app.locals.container.cradle.courtSpoeController.get);
  app.put('/courts/:slug/spoe',isSuperAdmin, app.locals.container.cradle.courtSpoeController.put);
  app.get('/courts/:slug/edit', app.locals.container.cradle.editCourtController.get);
  app.get('/courts/:slug/general-info', app.locals.container.cradle.generalInfoController.get);
  app.get('/courts/:slug/general-info', app.locals.container.cradle.generalInfoController.renderRedirect);
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
  app.get('/courts/:slug/photo', app.locals.container.cradle.photoController.get);
  app.get('/courts/:slug/photo/:imageToDelete/confirm-delete', app.locals.container.cradle.photoController.getDeleteConfirmation);
  app.put('/courts/:slug/photo', upload.single('photo'), app.locals.container.cradle.photoController.put);
  app.delete('/courts/:slug/photo', app.locals.container.cradle.photoController.delete);
  app.get('/courts/:slug/additionalLinks', isSuperAdmin, app.locals.container.cradle.additionalLinksController.get);
  app.put('/courts/:slug/additionalLinks', isSuperAdmin, app.locals.container.cradle.additionalLinksController.put);
  app.get('/courts/:slug/application-progression', app.locals.container.cradle.applicationProgressionController.get);
  app.put('/courts/:slug/application-progression', app.locals.container.cradle.applicationProgressionController.put);

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

  // General
  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);
}
