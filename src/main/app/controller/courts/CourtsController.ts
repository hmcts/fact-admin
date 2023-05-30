import autobind from 'autobind-decorator';
import {Response} from 'express';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Error} from '../../../types/Error';
import { NO_MATCHING_ROLES_ERROR} from '../../../utils/error';
import {ALLOWED_ROLES} from '../../../utils/roles';

@autobind
export class CourtsController {

  /**
   * GET /courts and /regions
   */
  getCourtsErrorMsg = 'A problem occurred when retrieving all court information.';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const errors: Error[] = [];
    let courts = await req.scope.cradle.api.getCourts();
    let regions = await req.scope.cradle.api.getRegions();
    const currentRoles = req.appSession['user']['jwt']['roles'] as string[];
    await req.scope.cradle.api.deleteCourtLocksByEmail(req.appSession.user.sub);

    if (courts.length == 0) {errors.push({text: this.getCourtsErrorMsg});}

    if (!currentRoles.some(i => ALLOWED_ROLES.includes(i))) {
      errors.push({text: NO_MATCHING_ROLES_ERROR});
      courts = [];
      regions = [];
      res.render('courts/courts', {courts, regions, errors });
    }

    res.render('courts/courts', { courts, regions, errors });
  }
}
