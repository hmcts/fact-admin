import { Response } from 'express';
import autobind from 'autobind-decorator';
import { AuthedRequest } from '../../../types/AuthedRequest';
import { CourtPageData } from '../../../types/CourtPageData';

@autobind
export class EditCourtGeneralController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const updated = req.query.updated === 'true';
    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.roles.includes('fact-super-admin'),
      court: {},
      updated: updated
    };
    const slug: string = req.params.slug as string;
    pageData.court = await req.scope.cradle.api.getCourtGeneral(slug);

    res.render('courts/edit-court-general', pageData);
  }

  public async post(req: AuthedRequest, res: Response): Promise<void> {
    const court = req.body;
    const slug: string = req.params.slug as string;
    const updatedCourts = await req.scope.cradle.api.updateCourtGeneral(slug, court);
    if (updatedCourts) {
      return res.redirect(`/courts/${slug}/edit/general?updated=true`);
    }
    return res.redirect(`/courts/${slug}/edit/general?updated=false`);
  }
}
