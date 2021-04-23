import * as path from 'path';
import * as express from 'express';
import * as nunjucks from 'nunjucks';
import {SelectItem} from '../../types/CourtPageData';

export class Nunjucks {
  constructor(public developmentMode: boolean) {
    this.developmentMode = developmentMode;
  }

  enableFor(app: express.Express): void {
    app.set('view engine', 'njk');
    const govUkFrontendPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'node_modules',
      'govuk-frontend',
    );
    const env = nunjucks.configure(
      [path.join(__dirname, '..', '..', 'views'), govUkFrontendPath],
      {
        autoescape: true,
        watch: this.developmentMode,
        express: app,
      },
    );

    env.addFilter('selectFilter', this.selectFilter);

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }

  private selectFilter(arr: SelectItem[], selectedId: string) {
    // Set selected property on selected item
    let itemSelected = false;
    arr.forEach(si => {
      if (si.value?.toString() === selectedId?.toString()) {
        si.selected = true;
        itemSelected = true;
      } else {
        si.selected = false;
      }
    });

    if (!itemSelected) {
      if (!arr.some(si => si.value === '')) {
        arr.splice(0, 0, {value: '', text: '', selected: true});
      }
    }
    return arr;
  }
}
