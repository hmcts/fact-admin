import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';

@autobind
export class EditCourtGeneralController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const updated = req.query.updated === 'true';
    const slug: string = req.params.slug as string;

    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      court: await req.scope.cradle.api.getCourtGeneral(slug),
      updated: updated
    };

    res.render('courts/edit-court-general', pageData);
  }
}
