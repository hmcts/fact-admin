import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Email} from '../../../types/Email';
import autobind from 'autobind-decorator';

@autobind
export class PostcodesController {

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    emails: Email[] = null): Promise<void> {

    console.log('get');
    res.render('courts/tabs/postcodesContent', {});
  }
}
