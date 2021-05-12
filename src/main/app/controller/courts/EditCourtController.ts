import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';
import config from 'config';
import Tokens from 'csrf';

@autobind
export class EditCourtController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {

    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      slug: req.params.slug,
      name: req.query.name?.toString(),
      csrfToken: new Tokens().create(config.get('csrf.tokenSecret'))
    };

    res.render('courts/edit-court-general', pageData);
  }
}
