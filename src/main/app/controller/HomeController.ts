import { Response } from 'express';
import { I18nRequest } from '../../types/I18nRequest';

export class HomeController {

  /**
   * GET /
   */
  public get(req: I18nRequest, res: Response): void {
    res.render('home', req.i18n.getDataByLanguage(req.lng).home);
  }

}
