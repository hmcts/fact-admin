import {Application} from 'express';
import {isSuperAdmin} from './modules/oidc';

export default function(app: Application): void {

  app.get('/', app.locals.container.cradle.homeController.get);
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

  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);
}
