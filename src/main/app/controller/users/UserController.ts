import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import config from 'config';

export class UserController {

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const userDashboard: string = config.get('services.idam.userDashboard');
    res.redirect(userDashboard);
  }


}
