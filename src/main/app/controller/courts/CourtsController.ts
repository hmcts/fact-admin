import autobind from 'autobind-decorator';
import {Response} from 'express';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Error} from '../../../types/Error';
import {Region} from '../../../types/Region';
import {GET_COURTS_ERROR, NO_MATCHING_ROLES_ERROR} from '../../../utils/error';
import {ALLOWED_ROLES} from '../../../utils/roles';

@autobind
export class CourtsController {

  /**
   * GET /courts and /regions
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const errors: Error[] = [];
    let courts: Array<unknown> = [];
    let regions: Array<Region> = [];
    const currentRoles = req.session['user']['jwt']['roles'] as string[];
    if (currentRoles.some(i => ALLOWED_ROLES.includes(i))) {
      courts = await req.scope.cradle.api.getCourts();
      regions = await req.scope.cradle.api.getRegions();
      await req.scope.cradle.api.deleteCourtLocksByEmail(req.session['user']['jwt']['sub']);
    }
    if (!currentRoles.some(i => ALLOWED_ROLES.includes(i))) {
      errors.push({text: NO_MATCHING_ROLES_ERROR});
    } else if (courts.length == 0) {
      errors.push({text: GET_COURTS_ERROR});
    }
    res.render('courts/courts', {courts, regions, errors});
  }
}
