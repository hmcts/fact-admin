import autobind from 'autobind-decorator';
import { Response } from 'express';
import { AuthedRequest } from '../../../types/AuthedRequest';
import config from 'config';

@autobind
export class CourtsController {

  /**
   * GET /courts
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const courts = await req.scope.cradle.api.getCourts();
    res.locals.frontEndUrl = config.get('services.frontend.url');

    res.render('courts/courts', { courts });
  }

}
