import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';
import {CSRF} from '../../../modules/csrf';
import * as flags from '../../feature-flags/flags';

@autobind
export class EditCourtController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {

    // With initial setup
    const featureFlags = await req.scope.cradle.featureFlags.getAllFlagValues();
    console.log('in edit court controller:');
    console.log(featureFlags);

    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      slug: req.params.slug,
      name: (await req.scope.cradle.api.getCourt(req.params.slug)).name,
      csrfToken: CSRF.create(),
      featureFlags: { values: featureFlags, flags }
    };

    res.render('courts/edit-court-general', pageData);
  }
}
