import * as path from 'path';
import * as express from 'express';
import * as nunjucks from 'nunjucks';
import {SelectItem} from '../../types/CourtPageData';
import {CSRF} from '../csrf';
import config from 'config';

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

    env.addFilter('selectFilter', this.selectFilter);

    env.addFilter('setAttribute', function(dictionary , key , value){
      dictionary[key] = value;
      return dictionary;
    });

    env.addFilter('is_not_a_number', function(obj) {
      return isNaN(obj);
    });

    env.addFilter('valid', function(string){
      const regExp = /[a-zA-Z]/g;
      return (!(regExp.test(string) || isNaN(string)) );

    });

    env.addGlobal('factFrontendURL', config.get('services.frontend.url'));

    env.addGlobal('csrf', CSRF.create());

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

    // If we don't have a selected item, add an empty item and select this.
    // This means the select control will show an empty value if there is no selection or
    // if the selected item doesn't exist in the array of items in the select.
    if (!itemSelected) {
      arr.splice(0, 0, {value: '', text: '', selected: true});
    }
    return arr;
  }

}
