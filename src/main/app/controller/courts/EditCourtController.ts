import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';
import {CSRF} from '../../../modules/csrf';
import * as flags from '../../feature-flags/flags';
import {ALL_FLAGS_FALSE_ERROR} from '../../../utils/error';
import {TAB_PREFIX} from '../../../utils/flagPrefix';

@autobind
export class EditCourtController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const featureFlags = await req.scope.cradle.featureFlags.getAllFlagValues();
    const filteredFlags = Object.fromEntries(Object.entries(featureFlags)
      .filter(([key]) => key.startsWith(TAB_PREFIX)));

    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      slug: req.params.slug,
      name: (await req.scope.cradle.api.getCourt(req.params.slug)).name,
      csrfToken: CSRF.create(),
      featureFlags: {values: featureFlags, flags: flags}
    };
    if(Object.values(filteredFlags).every((v) => v === false)){
      pageData.error = { flagsError: { message: ALL_FLAGS_FALSE_ERROR }};
    }

    res.render('courts/edit-court-general', pageData);
  }
}
