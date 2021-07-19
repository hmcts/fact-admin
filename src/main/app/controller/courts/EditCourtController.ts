import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';
import {CSRF} from '../../../modules/csrf';

@autobind
export class EditCourtController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      slug: req.params.slug,
      name: (await req.scope.cradle.api.getCourt(req.params.slug)).name,
      csrfToken: CSRF.create()
    };

    res.render('courts/edit-court-general', pageData);
  }
}
