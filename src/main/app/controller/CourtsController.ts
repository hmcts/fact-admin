import autobind from 'autobind-decorator';
import { Response } from 'express';
import { AuthedRequest } from '../../types/AuthedRequest';

@autobind
export class CourtsController {

  /**
   * GET /courts
   */
  public get(req: AuthedRequest, res: Response): void {
    res.render('courts');
  }

}
