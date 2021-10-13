import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';


export class AccountController {

  public async get(req: AuthedRequest, res: Response): Promise<void> {

    res.render('account/index');
  }


}
