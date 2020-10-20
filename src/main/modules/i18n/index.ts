import i18next from 'i18next';
const i18nextMiddleware = require('i18next-http-middleware');
import { Express, NextFunction, Response } from 'express';
import { I18nRequest } from '../../types/I18nRequest';

const requireDir = require('require-directory');
const resources = requireDir(module, '../../', {include: /locales/}).locales;

export class I18next {

  constructor() {
    const options = {preload: ['en', 'cy'], resources, fallbackLng: 'en', supportedLngs:['en','cy'], detection: {order: ['querystring']}};

    i18next
      .use(i18nextMiddleware.LanguageDetector)
      .init(options);
  }

  public enableFor(app: Express): void {
    app.use(i18nextMiddleware.handle(i18next));
    (app as any).use((req: I18nRequest, res: Response, next: NextFunction) => {
      Object.assign(res.locals, req.i18n.getDataByLanguage(req.lng).template);
      next();
    });
  }

}
