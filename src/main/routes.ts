import { Application } from 'express';
import { isAuthed } from './modules/passport';

export default function(app: Application): void {

  app.get('/', app.locals.container.cradle.homeController.get);
  app.get('/courts', isAuthed, app.locals.container.cradle.courtsController.get);

  app.use(app.locals.container.cradle.errorController.notFound);
  app.use(app.locals.container.cradle.errorController.internalServerError);

}
