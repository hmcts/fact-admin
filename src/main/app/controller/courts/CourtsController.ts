import autobind from 'autobind-decorator';
import {Response} from 'express';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Error} from '../../../types/Error';

@autobind
export class CourtsController {

  /**
   * GET /courts
   */
  getCourtsErrorMsg = 'A problem occurred when retrieving all court information.';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const errors: Error[] = [];
    console.log('goes into courts controller');
    const courts = await req.scope.cradle.api.getCourts();
    if (courts.length == 0) {errors.push({text: this.getCourtsErrorMsg});}
    res.render('courts/courts', { courts, errors });
  }
}
