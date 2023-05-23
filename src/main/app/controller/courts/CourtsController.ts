import autobind from 'autobind-decorator';
import {Response} from 'express';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Error} from '../../../types/Error';

@autobind
export class CourtsController {

  /**
   * GET /courts and /regions
   */
  getCourtsErrorMsg = 'A problem occurred when retrieving all court information.';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const errors: Error[] = [];
    const courts = await req.scope.cradle.api.getCourts();
    const regions = await req.scope.cradle.api.getRegions();
    await req.scope.cradle.api.deleteCourtLocksByEmail(req.appSession.user.email);
    if (courts.length == 0) {errors.push({text: this.getCourtsErrorMsg});}
    res.render('courts/courts', { courts, regions, errors });
  }
}
