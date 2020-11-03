import { Application } from 'express';

export default function(app: Application): void {

  app.get('/', app.locals.container.cradle.homeController.get);
  app.get('/courts', app.locals.container.cradle.courtsController.get);
  app.get('/courts/:slug', app.locals.container.cradle.courtDetailsController.get);
  app.get('/courts/:slug/edit/general', app.locals.container.cradle.editCourtGeneralController.get);
  app.post('/courts/:slug/edit/general', app.locals.container.cradle.editCourtGeneralController.post);

  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);

}
