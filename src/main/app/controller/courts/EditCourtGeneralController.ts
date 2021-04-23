import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';

@autobind
export class EditCourtGeneralController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const updated = req.query.updated === 'true';
    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      court: null,
      updated: updated
    };
    const slug: string = req.params.slug as string;
    pageData.court = await req.scope.cradle.api.getCourtGeneral(slug);
    res.render('courts/edit-court-general', pageData);
  }
}
