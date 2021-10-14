import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';


export class UserController {

  public async get(req: AuthedRequest, res: Response): Promise<void> {

    res.render('users/index');
  }


}
