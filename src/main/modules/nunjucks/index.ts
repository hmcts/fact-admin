import * as path from 'path';
import * as express from 'express';
import * as nunjucks from 'nunjucks';
import {CSRF} from '../csrf';
import config from 'config';
import createFilters from './njkFilters';

export class Nunjucks {
  constructor(public developmentMode: boolean) {
    this.developmentMode = developmentMode;
  }

  enableFor(app: express.Express): void {
    app.set('view engine', 'njk');
    const env = nunjucks.configure(
      [path.join(__dirname, '..', '..', 'views')],
      {
        autoescape: true,
        watch: this.developmentMode,
        express: app,
      },
    );


    createFilters(env);

    env.addGlobal('factFrontendURL', config.get('services.frontend.url'));
    env.addGlobal('govukRebrand', true);

    env.addGlobal('csrf', CSRF.create());

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }

}
