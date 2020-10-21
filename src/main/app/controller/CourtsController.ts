import autobind from 'autobind-decorator';
import { Response } from 'express';
import { AuthedRequest } from '../../types/AuthedRequest';

@autobind
export class CourtsController {

  /**
   * GET /courts
   */
  public get(req: AuthedRequest, res: Response): void {
    // todo make annotation?
    if (!req.isAuthenticated()) {
      res.redirect('/login');
    } else {
      res.render('courts', req.i18n.getDataByLanguage(req.lng).courts);
    }
  }

}
