import autobind from 'autobind-decorator';
import { Response } from 'express';
import { AuthedRequest } from '../../../types/AuthedRequest';

@autobind
export class CourtsController {

  /**
   * GET /courts
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const courts = await req.scope.cradle.api.getCourts();

    res.render('courts/courts', { courts });
  }

}
