import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {OpeningTime, OpeningTimeData, OpeningType} from '../../../types/OpeningTime';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';

@autobind
export class OpeningTimesController {

  private emptyTypeOrHoursErrorMsg = 'Type and hours are required for all opening times.';
  private updateErrorMessage = 'A problem occurred when saving the opening times.';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    openingTimes: OpeningTime[] = null) {

    const slug: string = req.params.slug as string;
    const pageData: OpeningTimeData = {
      'opening_times': openingTimes ?? await req.scope.cradle.api.getOpeningTimes(slug),
      openingTimeTypes: await this.getOpeningTimeTypes(req),
      errorMsg: error,
      updated: updated
    };

    res.render('courts/tabs/openingHoursContent', pageData);
  }

  public async post(req: AuthedRequest, res: Response) {
    const openingTimes = req.body.opening_times as OpeningTime[] ?? [];

    if (openingTimes.some(ot => !ot.type_id || ot.hours === '')) {
      // Retains the posted opening hours when errors exist
      return this.get(req, res, false, this.emptyTypeOrHoursErrorMsg, openingTimes);
    } else {
      const slug: string = req.params.slug as string;

      req.scope.cradle.api.updateOpeningTimes(slug, openingTimes)
        .then((value: OpeningTime[]) => this.get(req, res, true, '', value))
        .catch((reason: string) => this.get(req, res, false, this.updateErrorMessage, openingTimes));
    }
  }

  private async getOpeningTimeTypes(req: AuthedRequest): Promise<SelectItem[]> {
    const standardDescriptions = await req.scope.cradle.api.getOpeningTimeTypes();
    return standardDescriptions.map((ott: OpeningType) => (
      {value: ott.id, text: ott.type, selected: false}));
  }
}
