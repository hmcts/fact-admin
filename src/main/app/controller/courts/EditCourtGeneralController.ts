import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';
import {isObjectEmpty} from '../../../utils/validation';

@autobind
export class EditCourtGeneralController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const updated = req.query.updated === 'true';
    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      court: {},
      updated: updated
    };
    const slug: string = req.params.slug as string;
    pageData.court = await req.scope.cradle.api.getCourtGeneral(slug);
    res.render('courts/edit-court-general', pageData);
  }

  public async post(req: AuthedRequest, res: Response): Promise<void> {
    const court = req.body;
    EditCourtGeneralController.convertOpenAndAccessSchemeToBoolean(court);
    EditCourtGeneralController.removeDeletedOpeningTimes(court);
    EditCourtGeneralController.convertOpeningTimes(court);
    const slug: string = req.params.slug as string;
    const updatedCourts = await req.scope.cradle.api.updateCourtGeneral(slug, court);
    if (isObjectEmpty(updatedCourts)) {
      return res.redirect(`/courts/${slug}/edit/general?updated=false`);
    }
    return res.redirect(`/courts/${slug}/edit/general?updated=true`);
  }

  private static convertOpenAndAccessSchemeToBoolean(court: any): void {
    court.open = court.open === 'true';
    court['access_scheme'] = court['access_scheme'] === 'true';
  }

  private static removeDeletedOpeningTimes(court: any): void {
    if(court.deleteOpeningHours){
      court['description'].splice(court.deleteOpeningHours - 1 , 1);
      court['hours'].splice(court.deleteOpeningHours, 1);
    }
  }

  private static convertOpeningTimes(court: any): void {
    if (court['description']){
      const descriptions = Array.isArray(court['description']) ? court['description'] : [court['description']];
      const hours = Array.isArray(court['hours']) ? court['hours'] : [court['hours']];
      court['opening_times'] = descriptions
        .map((k: any, i: number) => ({ description: k, hours: hours[i]}))
        .filter((o: { description: string; hours: string }) => o.description !== '' && o.hours !== '');
    }
  }
}
