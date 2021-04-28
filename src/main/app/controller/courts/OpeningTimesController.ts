import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {OpeningTime, OpeningTimeData, OpeningType} from '../../../types/OpeningTime';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';

@autobind
export class OpeningTimesController {

  private emptyTypeOrHoursErrorMsg = 'Type and hours are required for all opening times.';
  private updateErrorMsg = 'A problem occurred when saving the opening times.';
  getOpeningTimesErrorMsg = 'A problem occurred when retrieving the opening times.';
  getOpeningTypesErrorMsg = 'A problem occurred when retrieving the opening time types.';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    openingTimes: OpeningTime[] = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!openingTimes) {
      await req.scope.cradle.api.getOpeningTimes(slug)
        .then((value: OpeningTime[]) => openingTimes = value)
        .catch(() => error += this.getOpeningTimesErrorMsg);
    }

    let types: OpeningType[] = [];
    await req.scope.cradle.api.getOpeningTimeTypes()
      .then((value: OpeningType[]) => types = value)
      .catch(() => error += this.getOpeningTypesErrorMsg);

    const pageData: OpeningTimeData = {
      'opening_times': openingTimes,
      openingTimeTypes: this.getOpeningTimeTypesForSelect(types),
      errorMsg: error,
      updated: updated
    };

    res.render('courts/tabs/openingHoursContent', pageData);
  }

  public async post(req: AuthedRequest, res: Response): Promise<void> {
    const openingTimes = req.body.opening_times as OpeningTime[] ?? [];

    if (openingTimes.some(ot => !ot.type_id || ot.hours === '')) {
      // Retains the posted opening hours when errors exist
      return this.get(req, res, false, this.emptyTypeOrHoursErrorMsg, openingTimes);
    } else {
      const slug: string = req.params.slug as string;

      await req.scope.cradle.api.updateOpeningTimes(slug, openingTimes)
        .then((value: OpeningTime[]) => this.get(req, res, true, '', value))
        .catch(() => this.get(req, res, false, this.updateErrorMsg, openingTimes));
    }
  }

  private getOpeningTimeTypesForSelect(standardTypes: OpeningType[]): SelectItem[] {
    return standardTypes.map((ott: OpeningType) => (
      {value: ott.id, text: ott.type, selected: false}));
  }
}
