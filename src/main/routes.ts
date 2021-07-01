import {Application} from 'express';
import {isSuperAdmin} from './modules/oidc';

export default function(app: Application): void {

  app.get('/', (req, res) => res.redirect('/courts'));
  app.get('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.get);
  app.post('/bulk-update', isSuperAdmin, app.locals.container.cradle.bulkUpdateController.post);
  app.get('/courts', app.locals.container.cradle.courtsController.get);
  app.get('/courts/download', app.locals.container.cradle.courtsDownloadController.get);
  app.get('/courts/:slug', app.locals.container.cradle.courtDetailsController.get);
  app.get('/courts/:slug/edit/general', app.locals.container.cradle.editCourtController.get);
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
  app.get('/courts/:slug/local-authorities-areas-of-law', app.locals.container.cradle.localAuthoritiesController.getAreasOfLaw);
  app.get('/courts/:slug/:areaOfLaw/local-authorities', app.locals.container.cradle.localAuthoritiesController.getLocalAuthorities);
  app.put('/courts/:slug/:areaOfLaw/local-authorities', isSuperAdmin, app.locals.container.cradle.localAuthoritiesController.put);

  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);
}
