import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import config from 'config';

export class UserController {
  /**
   * GET /users
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    res.redirect(config.get('services.idam.idamUserDashboardURL'));
  }


}
