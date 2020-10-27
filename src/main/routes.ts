import { Application } from 'express';

export default function(app: Application): void {

  app.get('/', app.locals.container.cradle.homeController.get);
  app.get('/courts', app.locals.container.cradle.courtsController.get);
  app.get('/court/:court', app.locals.container.cradle.courtDetailsController.get);

  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);

}
